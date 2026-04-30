
import React, { useState, useEffect } from 'react';
import Icon from './Icon';

interface MagicEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    onEdit: (prompt: string) => void;
    isEditing: boolean;
    error: string | null;
}

const MagicEditModal: React.FC<MagicEditModalProps> = ({ isOpen, onClose, imageSrc, onEdit, isEditing, error }) => {
    const [prompt, setPrompt] = useState('');
    const [showedImage, setShowedImage] = useState(imageSrc);

    useEffect(() => {
        if (isOpen) {
            setPrompt(''); // Reset prompt on open
        }
    }, [isOpen]);

    useEffect(() => {
        setShowedImage(imageSrc);
    }, [imageSrc]);
    
    if (!isOpen || !showedImage) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onEdit(prompt);
    };

    return (
        <div className="fixed inset-0 bg-boutique-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-boutique-ivory rounded-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.5)] w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh] border border-boutique-border/50" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-boutique-border/50 bg-boutique-bg/50">
                    <h2 className="text-xl font-heading font-semibold text-boutique-text tracking-tight flex items-center gap-2">
                        <Icon name="magic-wand" className="w-5 h-5 text-boutique-mauve"/>
                        Magic Edit
                    </h2>
                    <button onClick={onClose} className="text-boutique-muted hover:text-boutique-mauve transition-colors bg-boutique-bg hover:bg-boutique-blush p-2 rounded-full shadow-sm">
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                    <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-[24px] overflow-hidden bg-boutique-bg border border-boutique-border/50 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
                         <img src={showedImage} alt="Image to edit" className="w-full h-full object-contain" />
                         {isEditing && (
                            <div className="absolute inset-0 bg-boutique-ivory/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                                <div className="relative w-16 h-16 mb-4">
                                    <div className="absolute inset-0 border-[3px] border-boutique-blush rounded-full"></div>
                                    <div className="absolute inset-0 border-[3px] border-boutique-mauve border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon name="sparkles" className="w-5 h-5 text-boutique-mauve animate-pulse" />
                                    </div>
                                </div>
                                <p className="font-heading font-semibold text-boutique-text text-lg">Applying magic...</p>
                                <p className="text-[13px] text-boutique-muted mt-1">Refining your visual.</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                             <label htmlFor="edit-prompt" className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">
                                What would you like to change?
                            </label>
                            <input
                                id="edit-prompt"
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., add some rose petals"
                                disabled={isEditing}
                                className="w-full bg-boutique-bg border border-boutique-border/50 rounded-[16px] px-5 py-3.5 text-[13px] text-boutique-text focus:bg-boutique-ivory focus:ring-1 focus:ring-boutique-mauve/30 focus:border-boutique-mauve/50 transition-all duration-300 placeholder-boutique-muted/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            />
                        </div>
                        
                         {error && (
                            <div className="text-[13px] text-red-400 bg-red-900/20 border border-red-900/50 p-4 rounded-[16px] flex items-start gap-3">
                                <Icon name="close" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isEditing || !prompt}
                            className="w-full relative group overflow-hidden rounded-[20px] transition-all duration-500 shadow-[0_8px_24px_rgba(181,106,149,0.25)] hover:shadow-[0_12px_32px_rgba(181,106,149,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_24px_rgba(181,106,149,0.25)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-boutique-mauve via-boutique-plum to-boutique-mauve bg-[length:200%_auto] animate-gradient"></div>
                            <div className="relative px-8 py-4 flex items-center justify-center gap-3 text-boutique-ivory font-semibold tracking-wide">
                                {isEditing ? (
                                    <>
                                        <Icon name="spinner" className="animate-spin w-5 h-5" />
                                        <span className="text-[13px] uppercase tracking-[0.15em]">Editing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icon name="magic-wand" className="w-5 h-5" />
                                        <span className="text-[13px] uppercase tracking-[0.15em]">Apply Edit</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MagicEditModal;
