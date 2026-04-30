import React, { useState } from 'react';
import type { GeneratedImage } from '../types';
import Icon from './Icon';

interface PreviewPanelProps {
    generatedImages: GeneratedImage[];
    isGenerating: boolean;
    loadingMessage: string;
    error: string | null;
    captions: string[];
    onRegenerate: (id: string) => void;
    onGenerateScript: (id: string) => void;
    onOpenMagicEditModal: (id: string) => void;
    onPreview: (index: number) => void;
}

const ImageCard: React.FC<{ image: GeneratedImage, onPreview: () => void, onRegenerate: (id: string) => void, onGenerateScript: (id: string) => void, onOpenMagicEditModal: (id: string) => void, isRegenerating: boolean }> = ({ image, onPreview, onRegenerate, onGenerateScript, onOpenMagicEditModal, isRegenerating }) => {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = image.src;
        link.download = `pastelify-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div 
            className="group relative w-full aspect-[4/5] bg-boutique-bg rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(45,36,48,0.03)] hover:shadow-[0_12px_30px_rgba(45,36,48,0.08)] transition-all duration-500 cursor-pointer border border-boutique-border/50 hover:border-boutique-mauve/30"
            onClick={onPreview}
        >
            <img 
                src={image.src} 
                alt="Generated visual" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            
            {/* Floating Action Overlay - Compact Layout */}
            <div className="absolute inset-0 bg-boutique-text/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col items-center justify-center p-2 backdrop-blur-[2px]">
                <div className="flex flex-col gap-3 transform scale-95 md:scale-100 transition-transform duration-500 group-hover:scale-100 translate-y-2 group-hover:translate-y-0">
                    {/* Top Row: Primary Actions */}
                    <div className="flex gap-3 justify-center">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPreview(); }} 
                            className="w-10 h-10 bg-boutique-ivory/90 backdrop-blur-md rounded-full flex items-center justify-center text-boutique-text hover:text-boutique-mauve hover:scale-105 transition-all shadow-lg border border-white/50" 
                            title="View Full"
                        >
                            <Icon name="preview" className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={handleDownload} 
                            className="w-10 h-10 bg-boutique-ivory/90 backdrop-blur-md rounded-full flex items-center justify-center text-boutique-text hover:text-boutique-mauve hover:scale-105 transition-all shadow-lg border border-white/50" 
                            title="Download"
                        >
                            <Icon name="download" className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRegenerate(image.id); }} 
                            className="w-10 h-10 bg-boutique-ivory/90 backdrop-blur-md rounded-full flex items-center justify-center text-boutique-text hover:text-boutique-mauve hover:scale-105 transition-all shadow-lg border border-white/50" 
                            title="Regenerate"
                        >
                            <Icon name="regenerate" className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Bottom Row: Creative Tools */}
                    <div className="flex gap-3 justify-center">
                         <button 
                            onClick={(e) => { e.stopPropagation(); onOpenMagicEditModal(image.id); }} 
                            className="w-10 h-10 bg-boutique-text/80 backdrop-blur-md rounded-full flex items-center justify-center text-boutique-ivory hover:bg-boutique-mauve hover:scale-105 transition-all shadow-lg border border-white/20" 
                            title="Magic Edit"
                        >
                            <Icon name="magic-wand" className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onGenerateScript(image.id); }} 
                            className="w-10 h-10 bg-gradient-to-br from-boutique-mauve to-boutique-plum rounded-full flex items-center justify-center text-boutique-ivory hover:scale-105 transition-all shadow-lg border border-white/20" 
                            title="Video Script"
                        >
                            <Icon name="clapperboard" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Indicators */}
            {isRegenerating && (
                <div className="absolute inset-0 bg-boutique-ivory/80 backdrop-blur-sm flex items-center justify-center z-30">
                    <Icon name="spinner" className="animate-spin w-8 h-8 text-boutique-mauve" />
                </div>
            )}
        </div>
    );
};

const CaptionCard: React.FC<{ caption: string }> = ({ caption }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group bg-boutique-ivory p-6 rounded-[24px] border border-boutique-border shadow-[0_4px_16px_rgba(45,36,48,0.02)] hover:shadow-[0_8px_24px_rgba(45,36,48,0.04)] transition-all duration-300 flex flex-col gap-4">
            <p className="text-boutique-text text-[13px] leading-[1.8] whitespace-pre-wrap font-medium">{caption}</p>
            <div className="flex justify-end pt-2 border-t border-boutique-border/50">
                <button 
                    onClick={handleCopy} 
                    className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-4 py-2 rounded-full transition-all duration-300 ${
                        copied ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-boutique-bg text-boutique-muted hover:bg-boutique-blush hover:text-boutique-mauve border border-transparent hover:border-boutique-mauve/20'
                    }`}
                >
                    {copied ? 'Copied' : 'Copy Text'}
                </button>
            </div>
        </div>
    );
};

const PreviewPanel: React.FC<PreviewPanelProps> = (props) => {
    const { 
        generatedImages, isGenerating, loadingMessage, error, captions, 
        onRegenerate, onGenerateScript, onOpenMagicEditModal, onPreview
    } = props;

    if (isGenerating) {
        return (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 animate-pulse bg-boutique-ivory/50 rounded-[32px]">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-[3px] border-boutique-blush rounded-full"></div>
                    <div className="absolute inset-0 border-[3px] border-boutique-mauve border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon name="magic-wand" className="w-6 h-6 text-boutique-mauve animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-heading font-semibold text-boutique-text mb-2 tracking-tight">Crafting Aesthetics...</h3>
                <p className="text-boutique-muted text-[13px] max-w-xs mx-auto leading-relaxed">{loadingMessage}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-red-50/50 rounded-[32px] border border-red-100">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Icon name="close" className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-boutique-text">Oops, something went wrong</h3>
                <p className="text-boutique-muted text-[13px] mt-2 text-center max-w-xs leading-relaxed">{error}</p>
            </div>
        );
    }

    if (generatedImages.length === 0) {
        return (
            <div className="bg-boutique-ivory/50 border border-dashed border-boutique-border rounded-[32px] p-8 flex flex-col items-center justify-center text-center min-h-[500px] transition-all hover:border-boutique-mauve/40 group">
                <div className="w-16 h-16 bg-boutique-bg group-hover:bg-boutique-blush rounded-full flex items-center justify-center mb-4 text-boutique-muted group-hover:text-boutique-mauve transition-colors duration-500">
                    <Icon name="image" className="w-6 h-6" />
                </div>
                <h3 className="text-[15px] font-heading font-semibold text-boutique-text tracking-tight">Studio Canvas</h3>
                <p className="text-[13px] text-boutique-muted mt-2 max-w-[220px] leading-relaxed">
                    Your curated aesthetic visuals will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fadeIn">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-semibold text-boutique-text tracking-tight">Studio Results</h2>
                    <span className="text-[10px] font-semibold tracking-[0.15em] px-3 py-1.5 bg-boutique-blush text-boutique-mauve rounded-full uppercase border border-boutique-mauve/10">
                        {generatedImages.length} Photos
                    </span>
                </div>
                
                {/* Grid Layout: 2 Columns (Mobile & Desktop) */}
                <div className="grid grid-cols-2 gap-5 sm:gap-6">
                    {generatedImages.map((image) => (
                        <ImageCard 
                            key={image.id} 
                            image={image} 
                            onPreview={() => onPreview(generatedImages.findIndex(img => img.id === image.id))}
                            onRegenerate={onRegenerate}
                            onGenerateScript={onGenerateScript}
                            onOpenMagicEditModal={onOpenMagicEditModal}
                            isRegenerating={!!image.isRegenerating}
                        />
                    ))}
                </div>
            </div>

            {captions.length > 0 && (
                <div className="border-t border-boutique-border pt-8">
                    <h3 className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                        <Icon name="gemini" className="w-3.5 h-3.5" /> Editorial Copy
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {captions.map((caption, index) => (
                            <CaptionCard key={index} caption={caption} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewPanel;