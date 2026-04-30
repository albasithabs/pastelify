import React, { useState, useMemo } from 'react';
import type { VideoScript } from '../types';
import { VIDEO_PLATFORMS, VIDEO_STYLES, VideoPlatformKey, VideoStyleKey } from '../constants';
import Icon from './Icon';

interface ScriptGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    productDescription: string;
    onGenerate: (options: { platform: VideoPlatformKey, style: VideoStyleKey, duration: number, keyMessage: string }) => void;
    onRegenerateRequest: () => void;
    isGenerating: boolean;
    generatedScript: VideoScript | null;
    error: string | null;
}

const SegmentedControl: React.FC<{ options: { key: string; name: string }[]; value: string; onChange: (key: string) => void }> = ({ options, value, onChange }) => (
    <div className="flex w-full bg-boutique-bg rounded-[16px] p-1.5 border border-boutique-border/40">
        {options.map(option => (
            <button
                key={option.key}
                onClick={() => onChange(option.key)}
                className={`flex-1 py-2 px-3 text-[12px] font-semibold rounded-xl transition-all duration-300 focus:outline-none ${
                value === option.key
                    ? 'bg-boutique-ivory text-boutique-mauve shadow-[0_2px_8px_rgba(45,36,48,0.04)] border border-boutique-border/50'
                    : 'text-boutique-muted hover:text-boutique-text'
                }`}
            >
                {option.name}
            </button>
        ))}
    </div>
);


const ScriptResultDisplay: React.FC<{ script: VideoScript, onRegenerate: () => void }> = ({ script, onRegenerate }) => {
    const [copied, setCopied] = useState(false);

    const fullScriptText = `🎵 Audio Rekomendasi: ${script.recommendedAudio}\n\n🎬 SCENE BREAKDOWN\n\n${script.scenes.map(scene => 
        `> **${scene.duration.toUpperCase()} - ${scene.type}**\n> Visual: ${scene.visual}\n> Teks di Layar: "${scene.onScreenText}"\n> Narasi: "${scene.narration}"`
    ).join('\n\n')}\n\n${script.hashtags}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullScriptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 text-[13px] text-boutique-text h-full flex flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-boutique-blush/30 p-4 rounded-[20px] border border-boutique-mauve/10 flex items-start gap-3">
                    <Icon name="sparkles" className="w-5 h-5 text-boutique-mauve flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[11px] font-semibold text-boutique-mauve uppercase tracking-[0.15em] mb-1">Recommended Audio</p>
                        <p className="font-medium">{script.recommendedAudio}</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Icon name="clapperboard" className="w-4 h-4" /> Scene Breakdown
                    </h4>
                    <div className="space-y-4">
                        {script.scenes.map((scene, index) => (
                            <div key={index} className="bg-boutique-ivory p-5 rounded-[20px] border border-boutique-border/50 shadow-[0_2px_12px_rgba(45,36,48,0.02)] relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-boutique-mauve to-boutique-plum opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-bold bg-boutique-bg text-boutique-text px-2 py-1 rounded-md uppercase tracking-wider">{scene.duration}</span>
                                    <span className="text-[11px] font-semibold text-boutique-mauve uppercase tracking-[0.1em]">{scene.type}</span>
                                </div>
                                <div className="space-y-2.5">
                                    <p><strong className="text-boutique-muted font-semibold">Visual:</strong> {scene.visual}</p>
                                    <p><strong className="text-boutique-muted font-semibold">Text:</strong> <span className="italic">"{scene.onScreenText}"</span></p>
                                    <p><strong className="text-boutique-muted font-semibold">Narration:</strong> <span className="italic">"{scene.narration}"</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-boutique-bg p-4 rounded-[20px] border border-boutique-border/50">
                    <p className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.15em] mb-1">Hashtags</p>
                    <p className="font-medium text-boutique-mauve">{script.hashtags}</p>
                </div>
            </div>
            <div className="flex-shrink-0 pt-4 border-t border-boutique-border/50 flex gap-3">
                <button onClick={onRegenerate} className="flex-1 bg-boutique-ivory text-boutique-text font-semibold py-3.5 px-4 rounded-[16px] hover:bg-boutique-bg transition-all duration-300 border border-boutique-border hover:border-boutique-mauve/40">
                    Regenerate
                </button>
                 <button onClick={handleCopy} className="flex-1 bg-boutique-text text-boutique-ivory font-semibold py-3.5 px-4 rounded-[16px] hover:bg-boutique-text/90 transition-all duration-300 shadow-[0_4px_12px_rgba(45,36,48,0.15)] flex items-center justify-center gap-2">
                    {copied ? (
                        <><Icon name="check" className="w-4 h-4" /> Copied</>
                    ) : (
                        'Copy Script'
                    )}
                </button>
            </div>
        </div>
    );
};


const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = (props) => {
    const { isOpen, onClose, imageSrc, productDescription, onGenerate, onRegenerateRequest, isGenerating, generatedScript, error } = props;
    
    const [platform, setPlatform] = useState<VideoPlatformKey>('tiktokReels');
    const [style, setStyle] = useState<VideoStyleKey>('aesthetic');
    const [duration, setDuration] = useState(10);
    const [keyMessage, setKeyMessage] = useState('');
    
    const platformOptions = useMemo(() => Object.entries(VIDEO_PLATFORMS).map(([key, { name }]) => ({ key, name })), []);
    const styleOptions = useMemo(() => Object.entries(VIDEO_STYLES).map(([key, { name }]) => ({ key, name })), []);

    const handleClose = () => {
        setPlatform('tiktokReels');
        setStyle('aesthetic');
        setDuration(10);
        setKeyMessage('');
        onClose();
    };

    const handleSubmit = () => {
        onGenerate({ platform, style, duration, keyMessage });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-boutique-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-boutique-ivory rounded-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.5)] w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] border border-boutique-border/50" onClick={(e) => e.stopPropagation()}>
                {/* Left Panel - Image */}
                <div className="w-full md:w-2/5 flex-shrink-0 bg-boutique-bg relative">
                    <img src={imageSrc} alt="Product" className="w-full h-48 md:h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-boutique-bg/80 to-transparent md:hidden"></div>
                </div>

                {/* Right Panel - Controls & Result */}
                <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col overflow-hidden bg-boutique-ivory">
                    <div className="flex justify-between items-start mb-8 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-heading font-semibold text-boutique-text tracking-tight flex items-center gap-2">
                                <Icon name="clapperboard" className="w-6 h-6 text-boutique-mauve" /> Video Script Studio
                            </h2>
                            <p className="text-[13px] text-boutique-muted mt-1 font-medium">Transform your visual into a viral concept.</p>
                        </div>
                        <button onClick={handleClose} className="text-boutique-muted hover:text-boutique-mauve transition-colors bg-boutique-bg hover:bg-boutique-blush p-2 rounded-full">
                            <Icon name="close" className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto -mr-4 pr-4 custom-scrollbar">
                        {isGenerating ? (
                             <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                                <div className="relative w-16 h-16 mb-6">
                                    <div className="absolute inset-0 border-[3px] border-boutique-blush rounded-full"></div>
                                    <div className="absolute inset-0 border-[3px] border-boutique-mauve border-t-transparent rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon name="magic-wand" className="w-5 h-5 text-boutique-mauve animate-pulse" />
                                    </div>
                                </div>
                                <p className="font-heading font-semibold text-boutique-text text-lg">Writing your script...</p>
                                <p className="text-[13px] text-boutique-muted mt-2">Crafting the perfect hook.</p>
                            </div>
                        ) : error ? (
                             <div className="text-center bg-red-900/20 border border-red-900/50 p-8 rounded-[24px] h-full flex flex-col justify-center items-center">
                                <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                    <Icon name="close" className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-red-400 font-semibold font-heading">Oops, something went wrong</h3>
                                <p className="text-red-400/80 mt-2 text-[13px]">{error}</p>
                            </div>
                        ) : generatedScript ? (
                            <ScriptResultDisplay script={generatedScript} onRegenerate={onRegenerateRequest} />
                        ) : (
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">Platform</label>
                                    <SegmentedControl options={platformOptions} value={platform} onChange={(key) => setPlatform(key as VideoPlatformKey)} />
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">Content Style</label>
                                    <SegmentedControl options={styleOptions} value={style} onChange={(key) => setStyle(key as VideoStyleKey)} />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label htmlFor="duration" className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em]">Duration</label>
                                        <span className="text-[12px] font-semibold text-boutique-mauve bg-boutique-blush/50 px-3 py-1 rounded-full">{duration}s</span>
                                    </div>
                                    <input id="duration" type="range" min="5" max="15" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full h-1.5 bg-boutique-border rounded-lg appearance-none cursor-pointer accent-boutique-mauve"/>
                                </div>
                                <div>
                                    <label htmlFor="keyMessage" className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">Key Message <span className="text-boutique-muted/50 normal-case tracking-normal">(Optional)</span></label>
                                    <input id="keyMessage" type="text" value={keyMessage} onChange={(e) => setKeyMessage(e.target.value)} className="w-full bg-boutique-ivory border border-boutique-border/50 rounded-[16px] px-5 py-3.5 text-[13px] text-boutique-text focus:bg-[#262626] focus:ring-1 focus:ring-boutique-mauve/30 focus:border-boutique-mauve/50 transition-all duration-300 placeholder-boutique-muted/50 shadow-[inset_0_2px_4px_rgba(45,36,48,0.02)]" placeholder="e.g. Focus on the waterproof material" />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {!generatedScript && !isGenerating && !error && (
                        <div className="mt-8 pt-6 border-t border-boutique-border/50 flex-shrink-0">
                             <button
                                onClick={handleSubmit}
                                disabled={isGenerating || !productDescription}
                                className="w-full relative group overflow-hidden rounded-[20px] transition-all duration-500 shadow-[0_8px_24px_rgba(181,106,149,0.25)] hover:shadow-[0_12px_32px_rgba(181,106,149,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_8px_24px_rgba(181,106,149,0.25)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-boutique-mauve via-boutique-plum to-boutique-mauve bg-[length:200%_auto] animate-gradient"></div>
                                <div className="relative px-8 py-4 flex items-center justify-center gap-3 text-boutique-ivory font-semibold tracking-wide">
                                    <Icon name="magic-wand" className="w-5 h-5" />
                                    <span className="text-[13px] uppercase tracking-[0.15em]">Generate Script</span>
                                </div>
                            </button>
                            {!productDescription && <p className="text-[11px] text-boutique-mauve text-center mt-3 font-medium">Please provide a product description first.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScriptGeneratorModal;