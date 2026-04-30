import React, { useRef, useState } from 'react';
import type { BackgroundThemeKey, CameraAngleKey, LightStyleKey, CaptionLanguageKey, AiDecorationKey, ModelInteractionKey, ShotCompositionKey, AestheticHandKey, AspectRatioKey } from '../constants';
import { BACKGROUND_THEMES, CAMERA_ANGLES, LIGHTING_STYLES, CAPTION_LANGUAGES, AI_DECORATIONS, MODEL_INTERACTIONS, SHOT_COMPOSITIONS, AESTHETIC_HANDS, ASPECT_RATIOS } from '../constants';
import Icon from './Icon';

interface ControlPanelProps {
    uploadedImages: string[];
    activeImageIndex: number;
    onImageUpload: (images: string[]) => void;
    onRemoveUploadedImage: (index: number) => void;
    setActiveImageIndex: (index: number) => void;
    // NEW Props
    generationMode: 'single' | 'group';
    setGenerationMode: (mode: 'single' | 'group') => void;

    onGenerateAIDescription: () => void;
    
    modelImage: string | null;
    onModelImageUpload: (image: string) => void;
    onRemoveModelImage: () => void;
    backgroundImage: string | null;
    onBackgroundImageUpload: (image: string) => void;
    onRemoveBackgroundImage: () => void;
    productDescription: string;
    setProductDescription: (desc: string) => void;
    isDescribingProduct: boolean;
    selectedTheme: BackgroundThemeKey;
    setSelectedTheme: (theme: BackgroundThemeKey) => void;
    cameraAngle: CameraAngleKey;
    setCameraAngle: (angle: CameraAngleKey) => void;
    lightStyle: LightStyleKey;
    setLightStyle: (style: LightStyleKey) => void;
    pastelLevel: number;
    setPastelLevel: (level: number) => void;
    numImages: number;
    setNumImages: (num: number) => void;
    excludeText: boolean;
    setExcludeText: (exclude: boolean) => void;
    captionLanguage: CaptionLanguageKey;
    setCaptionLanguage: (lang: CaptionLanguageKey) => void;
    dominantColors: string;
    setDominantColors: (colors: string) => void;
    extraProps: string;
    setExtraProps: (props: string) => void;
    selectedDecorations: Set<AiDecorationKey>;
    setSelectedDecorations: (decorations: Set<AiDecorationKey>) => void;
    modelInteraction: ModelInteractionKey;
    setModelInteraction: (interaction: ModelInteractionKey) => void;
    shotComposition: ShotCompositionKey;
    setShotComposition: (composition: ShotCompositionKey) => void;
    aestheticHand: AestheticHandKey;
    setAestheticHand: (hand: AestheticHandKey) => void;
    aspectRatio: AspectRatioKey;
    setAspectRatio: (ratio: AspectRatioKey) => void;
    onGenerate: () => void;
    isGenerating: boolean;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    backgroundDescription: string;
    isAnalyzingBackground: boolean;
}

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group inline-block ml-1 align-middle">
      <Icon name="info" className="w-3 h-3 text-boutique-muted hover:text-boutique-text cursor-help transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-boutique-text/95 backdrop-blur-md text-boutique-ivory text-[10px] leading-relaxed rounded-xl shadow-[0_8px_16px_rgba(45,36,48,0.15)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 transform translate-y-1 group-hover:translate-y-0 font-medium tracking-wide">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-boutique-text/95"></div>
      </div>
    </div>
);

// New Component: Grid Selection Card (Used for Angles, Lighting, etc.)
const GridSelectOption: React.FC<{ 
    label: string; 
    description?: string; 
    isSelected: boolean; 
    onClick: () => void; 
}> = ({ label, description, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`relative flex flex-col items-start p-3.5 rounded-[16px] border transition-all duration-300 text-left h-full ${
            isSelected 
                ? 'bg-boutique-blush/40 border-boutique-mauve shadow-[0_2px_8px_rgba(181,106,149,0.08)] ring-1 ring-boutique-mauve/20' 
                : 'bg-boutique-ivory border-boutique-border hover:border-boutique-mauve/40 hover:bg-boutique-bg'
        }`}
    >
        <div className="flex items-center justify-between w-full mb-1.5">
            <span className={`text-[13px] font-semibold tracking-tight ${isSelected ? 'text-boutique-mauve' : 'text-boutique-text'}`}>
                {label}
            </span>
            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-boutique-mauve shadow-[0_0_4px_rgba(181,106,149,0.4)]" />}
        </div>
        {description && (
            <p className="text-[10px] text-boutique-muted leading-[1.6] line-clamp-2 font-medium">
                {description}
            </p>
        )}
    </button>
);

// New Component: Compact Theme Card
const ThemeCard: React.FC<{
    theme: typeof BACKGROUND_THEMES[keyof typeof BACKGROUND_THEMES];
    isSelected: boolean;
    onClick: () => void;
}> = ({ theme, isSelected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`group relative flex flex-col items-start w-full rounded-[20px] overflow-hidden transition-all duration-300 border ${
            isSelected ? 'border-boutique-mauve ring-2 ring-boutique-mauve/20 ring-offset-1 ring-offset-boutique-ivory shadow-[0_4px_12px_rgba(181,106,149,0.1)]' : 'border-boutique-border hover:border-boutique-mauve/40 hover:shadow-[0_4px_16px_rgba(45,36,48,0.04)]'
        }`}
    >
        <div className="w-full h-24 overflow-hidden bg-boutique-bg">
            <img 
                src={theme.thumbnail} 
                alt={theme.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {isSelected && (
                <div className="absolute top-2.5 right-2.5 bg-boutique-ivory/90 backdrop-blur-md text-boutique-mauve text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wider uppercase border border-boutique-mauve/20">
                    Active
                </div>
            )}
        </div>
        <div className="p-3.5 w-full bg-boutique-ivory border-t border-boutique-border/50">
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[15px]">{theme.emoji}</span>
                <span className={`text-[12px] font-semibold tracking-tight ${isSelected ? 'text-boutique-mauve' : 'text-boutique-text'}`}>
                    {theme.name}
                </span>
            </div>
            <p className="text-[10px] text-boutique-muted leading-[1.6] line-clamp-2 text-left font-medium">
                {theme.prompt}
            </p>
        </div>
    </button>
);

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const {
        uploadedImages, activeImageIndex, onImageUpload, onRemoveUploadedImage, setActiveImageIndex,
        generationMode, setGenerationMode,
        onGenerateAIDescription,
        modelImage, onModelImageUpload, onRemoveModelImage,
        backgroundImage, onBackgroundImageUpload, onRemoveBackgroundImage,
        productDescription, setProductDescription, isDescribingProduct,
        selectedTheme, setSelectedTheme, cameraAngle, setCameraAngle,
        lightStyle, setLightStyle, pastelLevel, setPastelLevel,
        numImages, setNumImages, excludeText, setExcludeText,
        captionLanguage, setCaptionLanguage, onGenerate, isGenerating,
        dominantColors, setDominantColors, extraProps, setExtraProps,
        selectedDecorations, setSelectedDecorations, modelInteraction, setModelInteraction,
        shotComposition, setShotComposition, aestheticHand, setAestheticHand,
        aspectRatio, setAspectRatio,
        currentStep, setCurrentStep,
        backgroundDescription, isAnalyzingBackground,
    } = props;
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modelFileInputRef = useRef<HTMLInputElement>(null);
    const backgroundFileInputRef = useRef<HTMLInputElement>(null);

    const [backgroundMode, setBackgroundMode] = useState<'theme' | 'upload'>('theme');
    
    const steps = [
        { id: 1, name: '1. Product & Assets', short: 'Assets' },
        { id: 2, name: '2. Style & Theme', short: 'Style' },
        { id: 3, name: '3. Composition', short: 'Comp' },
        { id: 4, name: '4. Final Polish', short: 'Final' },
    ];

    const createInputHandler = (setter: (data: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setter(event.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Modified handler for multiple image uploads
    const handleMultiImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const promises: Promise<string>[] = [];
            const remainingSlots = 10 - uploadedImages.length;
            const filesToProcess = Array.from(files).slice(0, remainingSlots);

            filesToProcess.forEach(file => {
                promises.push(new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.readAsDataURL(file as Blob);
                }));
            });

            Promise.all(promises).then(newImages => {
                onImageUpload(newImages);
            });
        }
    };
    
    const createDropHandler = (setter: (data: string[]) => void) => (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
             const promises: Promise<string>[] = [];
             const remainingSlots = 10 - uploadedImages.length;
             const filesToProcess = Array.from(files).slice(0, remainingSlots);

            filesToProcess.forEach(file => {
                promises.push(new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target?.result as string);
                    reader.readAsDataURL(file as Blob);
                }));
            });

            Promise.all(promises).then(newImages => {
                setter(newImages);
            });
        }
    };

    const handleDecorationChange = (key: AiDecorationKey) => {
        const newDecorations = new Set(selectedDecorations);
        if (newDecorations.has(key)) { newDecorations.delete(key); } 
        else { newDecorations.add(key); }
        setSelectedDecorations(newDecorations);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Horizontal Tab Navigation */}
            <div className="flex items-center border-b border-boutique-border/60 bg-boutique-ivory/50 px-4 pt-2">
                {steps.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => (step.id < currentStep || (step.id === 1 && uploadedImages.length > 0)) && setCurrentStep(step.id)}
                        disabled={step.id > currentStep && uploadedImages.length === 0}
                        className={`flex-1 py-5 text-center relative transition-all duration-300 ${
                            currentStep === step.id 
                                ? 'text-boutique-mauve font-semibold' 
                                : step.id < currentStep 
                                    ? 'text-boutique-text hover:text-boutique-mauve' 
                                    : 'text-boutique-muted/50 cursor-not-allowed'
                        }`}
                    >
                        <span className="text-[11px] uppercase tracking-[0.15em] block">{window.innerWidth < 640 ? step.short : step.name}</span>
                        {currentStep === step.id && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[3px] bg-gradient-to-r from-boutique-mauve to-boutique-plum rounded-t-full shadow-[0_-2px_8px_rgba(181,106,149,0.4)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {currentStep === 1 && (
                    <div className="space-y-10 animate-fadeIn">
                         {/* Upload Section */}
                         <div className="space-y-4">
                            <div className="flex justify-between items-baseline">
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em]">Product Assets</label>
                                <span className={`text-[10px] font-semibold px-3 py-1 rounded-full border ${uploadedImages.length > 0 ? 'bg-boutique-blush/50 text-boutique-mauve border-boutique-mauve/20' : 'bg-boutique-bg text-boutique-muted border-transparent'}`}>
                                    {uploadedImages.length}/10 Uploaded
                                </span>
                            </div>
                            
                            {/* Upload Area */}
                            {uploadedImages.length < 10 && (
                                <div 
                                    className={`group relative border border-dashed rounded-[24px] p-10 text-center cursor-pointer transition-all duration-500 ${
                                        uploadedImages.length > 0
                                            ? 'border-boutique-border bg-boutique-ivory/50 hover:border-boutique-mauve/40 hover:bg-boutique-ivory'
                                            : 'border-boutique-mauve/30 bg-boutique-blush/20 hover:bg-boutique-blush/40 hover:border-boutique-mauve/50' 
                                    }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={createDropHandler(onImageUpload)}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleMultiImageUpload} className="hidden"/>
                                    <div className="py-2">
                                        <div className="w-14 h-14 bg-boutique-ivory rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_4px_12px_rgba(45,36,48,0.04)] border border-boutique-border/50 group-hover:shadow-[0_8px_20px_rgba(181,106,149,0.15)] group-hover:scale-110 transition-all duration-500">
                                            <Icon name="upload" className="w-6 h-6 text-boutique-muted group-hover:text-boutique-mauve transition-colors duration-500"/>
                                        </div>
                                        <p className="text-[14px] font-medium text-boutique-text">
                                            {uploadedImages.length > 0 ? "Add more visuals" : "Click or drag to upload"}
                                        </p>
                                        <p className="text-[11px] text-boutique-muted mt-2 tracking-wide">Up to 10 high-quality images</p>
                                    </div>
                                </div>
                            )}

                            {/* Generation Mode Selector - Only visible when multiple images */}
                            {uploadedImages.length > 1 && (
                                <div className="bg-boutique-blush/30 border border-boutique-mauve/10 rounded-[20px] p-4">
                                    <label className="text-[10px] font-semibold text-boutique-mauve uppercase tracking-[0.2em] block mb-3">Generation Mode</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setGenerationMode('single')}
                                            className={`py-2.5 px-4 rounded-xl text-[12px] font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                                                generationMode === 'single'
                                                ? 'bg-boutique-mauve text-boutique-ivory shadow-[0_4px_12px_rgba(181,106,149,0.2)]'
                                                : 'bg-boutique-ivory text-boutique-text hover:bg-boutique-blush border border-boutique-border/50'
                                            }`}
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
                                            Focus Active (1)
                                        </button>
                                        <button
                                            onClick={() => setGenerationMode('group')}
                                            className={`py-2.5 px-4 rounded-xl text-[12px] font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                                                generationMode === 'group'
                                                ? 'bg-boutique-mauve text-boutique-ivory shadow-[0_4px_12px_rgba(181,106,149,0.2)]'
                                                : 'bg-boutique-ivory text-boutique-text hover:bg-boutique-blush border border-boutique-border/50'
                                            }`}
                                        >
                                            <Icon name="preview" className="w-3.5 h-3.5 opacity-70"/>
                                            Group/Bundle (All)
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-boutique-muted mt-3 text-center leading-relaxed">
                                        {generationMode === 'single' 
                                            ? 'Process only the highlighted image selected below.'
                                            : 'Combine ALL uploaded images into a single group composition.'}
                                    </p>
                                </div>
                            )}

                            {/* Gallery Grid */}
                            {uploadedImages.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
                                    {uploadedImages.map((src, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setActiveImageIndex(index)}
                                            className={`relative aspect-square rounded-[16px] overflow-hidden cursor-pointer group transition-all duration-300 border ${
                                                activeImageIndex === index 
                                                    ? 'border-boutique-mauve ring-2 ring-boutique-mauve/20 ring-offset-2 ring-offset-boutique-ivory z-10 shadow-[0_4px_12px_rgba(181,106,149,0.15)]' 
                                                    : generationMode === 'group' 
                                                        ? 'border-boutique-mauve/30 ring-1 ring-boutique-mauve/10 opacity-90' 
                                                        : 'border-boutique-border hover:border-boutique-mauve/40 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={src} alt={`Product ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRemoveUploadedImage(index); }}
                                                className="absolute top-2 right-2 bg-boutique-ivory/90 backdrop-blur-md text-red-400 rounded-full w-7 h-7 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all duration-300 border border-white/50"
                                                title="Remove"
                                            >
                                                <Icon name="close" className="w-3.5 h-3.5" />
                                            </button>
                                            {/* Active Indicator Label */}
                                            {activeImageIndex === index && generationMode === 'single' && (
                                                <div className="absolute bottom-0 inset-x-0 bg-boutique-mauve/90 backdrop-blur-sm text-boutique-ivory text-[9px] font-semibold tracking-wider text-center py-1 uppercase">
                                                    Active
                                                </div>
                                            )}
                                            {generationMode === 'group' && (
                                                <div className="absolute top-2 left-2 bg-boutique-ivory/90 backdrop-blur-md text-boutique-mauve rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold shadow-sm border border-white/50">
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em]">Product Details</label>
                                {uploadedImages.length > 0 && (
                                    <button
                                        onClick={onGenerateAIDescription}
                                        disabled={isDescribingProduct}
                                        className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-boutique-ivory bg-gradient-to-r from-boutique-mauve to-boutique-plum px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(181,106,149,0.2)] hover:shadow-[0_6px_16px_rgba(181,106,149,0.3)] transition-all duration-300 disabled:opacity-50 uppercase"
                                    >
                                        <Icon name="magic-wand" className="w-3.5 h-3.5" />
                                        Auto Describe
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <textarea
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-boutique-ivory border border-boutique-border/50 rounded-[16px] px-5 py-4 text-[13px] text-boutique-text focus:bg-white focus:ring-1 focus:ring-boutique-mauve/30 focus:border-boutique-mauve/50 transition-all duration-300 placeholder-boutique-muted/50 resize-none shadow-[inset_0_2px_4px_rgba(45,36,48,0.02)]"
                                    placeholder={isDescribingProduct ? "AI is analyzing the image..." : "e.g. A minimalist pastel pink water bottle with a wooden cap..."}
                                    disabled={isDescribingProduct}
                                />
                                <div className="absolute bottom-3 right-4 text-[10px] text-boutique-muted/60 pointer-events-none font-medium">
                                    {productDescription.length} chars
                                </div>
                            </div>
                        </div>

                        {/* Optional Model Upload */}
                        <div className="pt-8 border-t border-boutique-border/50">
                             <label className="flex items-center gap-3 text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-5 cursor-pointer hover:text-boutique-mauve transition-colors" onClick={() => document.getElementById('model-section')?.classList.toggle('hidden')}>
                                <span className="w-5 h-5 rounded-md bg-boutique-bg flex items-center justify-center text-boutique-text border border-boutique-border/50">+</span>
                                Advanced: Human Model
                             </label>
                             
                             <div id="model-section" className={`${!modelImage ? '' : ''} space-y-5`}>
                                <div className="flex gap-5 items-start">
                                    <div 
                                        className="w-28 h-28 flex-shrink-0 border border-dashed border-boutique-border rounded-[20px] flex flex-col items-center justify-center cursor-pointer hover:border-boutique-mauve/40 hover:bg-boutique-blush/20 transition-all duration-300 bg-boutique-ivory/50"
                                        onClick={() => modelFileInputRef.current?.click()}
                                    >
                                        <input type="file" accept="image/*" ref={modelFileInputRef} onChange={createInputHandler(onModelImageUpload)} className="hidden"/>
                                        {modelImage ? (
                                            <div className="relative w-full h-full p-1">
                                                <img src={modelImage} alt="Model" className="w-full h-full object-cover rounded-[16px]" />
                                                <button onClick={(e) => {e.stopPropagation(); onRemoveModelImage()}} className="absolute -top-2 -right-2 bg-boutique-ivory/90 backdrop-blur-md text-red-400 rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-all border border-white/50"><Icon name="close" className="w-3 h-3"/></button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-boutique-muted text-center px-2 font-medium tracking-wide">Upload Model</span>
                                        )}
                                    </div>
                                    {modelImage && (
                                        <div className="flex-1">
                                            <label className="text-[10px] font-semibold text-boutique-muted uppercase tracking-[0.15em] mb-3 block">Interaction</label>
                                            <div className="grid grid-cols-1 gap-3">
                                                {Object.entries(MODEL_INTERACTIONS).map(([key, {name, prompt}]) => (
                                                    <GridSelectOption 
                                                        key={key} 
                                                        label={name}
                                                        description={prompt}
                                                        isSelected={modelInteraction === key} 
                                                        onClick={() => setModelInteraction(key as ModelInteractionKey)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-10 animate-fadeIn">
                        {/* Background Mode Selector */}
                        <div className="flex p-1.5 bg-boutique-bg rounded-2xl w-full border border-boutique-border/40">
                            {[{key: 'theme', name: 'Select Theme'}, {key: 'upload', name: 'Custom Upload'}].map((mode) => (
                                <button
                                    key={mode.key}
                                    onClick={() => setBackgroundMode(mode.key as 'theme' | 'upload')}
                                    className={`flex-1 py-2.5 text-[12px] font-semibold rounded-xl transition-all duration-300 ${
                                        backgroundMode === mode.key 
                                            ? 'bg-boutique-ivory text-boutique-mauve shadow-[0_2px_8px_rgba(45,36,48,0.04)] border border-boutique-border/50' 
                                            : 'text-boutique-muted hover:text-boutique-text'
                                    }`}
                                >
                                    {mode.name}
                                </button>
                            ))}
                        </div>

                        {backgroundMode === 'theme' ? (
                            <div>
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-5 block">Aesthetic Theme</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(BACKGROUND_THEMES).map(([key, theme]) => (
                                        <ThemeCard
                                            key={key}
                                            theme={theme}
                                            isSelected={selectedTheme === key}
                                            onClick={() => setSelectedTheme(key as BackgroundThemeKey)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div 
                                    className="border border-dashed border-boutique-border bg-boutique-ivory/50 rounded-[24px] p-10 text-center hover:border-boutique-mauve/40 hover:bg-boutique-blush/20 transition-all duration-300 cursor-pointer"
                                    onClick={() => backgroundFileInputRef.current?.click()}
                                >
                                    <input type="file" accept="image/*" ref={backgroundFileInputRef} onChange={createInputHandler(onBackgroundImageUpload)} className="hidden"/>
                                    {backgroundImage ? (
                                        <div className="relative max-w-xs mx-auto">
                                            <img src={backgroundImage} className="rounded-[16px] shadow-[0_8px_24px_rgba(45,36,48,0.08)]" />
                                            <button onClick={(e)=>{e.stopPropagation(); onRemoveBackgroundImage()}} className="absolute -top-3 -right-3 bg-boutique-ivory/90 backdrop-blur-md text-red-400 shadow-sm p-1.5 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-white/50"><Icon name="close" className="w-4 h-4"/></button>
                                        </div>
                                    ) : (
                                        <p className="text-[13px] text-boutique-muted font-medium">Click to upload background reference</p>
                                    )}
                                </div>
                                {backgroundImage && (
                                    <div className="bg-boutique-blush/30 p-5 rounded-[20px] border border-boutique-mauve/10">
                                        <div className="flex items-center gap-2 text-boutique-mauve text-[11px] uppercase tracking-wider font-semibold mb-3">
                                            <Icon name="magic-wand" className="w-3.5 h-3.5"/> AI Analysis
                                        </div>
                                        <p className="text-[13px] text-boutique-text leading-relaxed font-medium">
                                            {isAnalyzingBackground ? "Analyzing..." : (backgroundDescription || "Description will appear here.")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">Dominant Colors (Optional)</label>
                                <input 
                                    type="text" 
                                    value={dominantColors} 
                                    onChange={(e) => setDominantColors(e.target.value)}
                                    className="w-full bg-boutique-ivory border border-boutique-border/50 rounded-[16px] px-5 py-3.5 text-[13px] text-boutique-text focus:bg-white focus:ring-1 focus:ring-boutique-mauve/30 focus:border-boutique-mauve/50 transition-all duration-300 placeholder-boutique-muted/50 shadow-[inset_0_2px_4px_rgba(45,36,48,0.02)]"
                                    placeholder="e.g. sage green, soft lilac"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">Extra Props</label>
                                <input 
                                    type="text" 
                                    value={extraProps} 
                                    onChange={(e) => setExtraProps(e.target.value)}
                                    className="w-full bg-boutique-ivory border border-boutique-border/50 rounded-[16px] px-5 py-3.5 text-[13px] text-boutique-text focus:bg-white focus:ring-1 focus:ring-boutique-mauve/30 focus:border-boutique-mauve/50 transition-all duration-300 placeholder-boutique-muted/50 shadow-[inset_0_2px_4px_rgba(45,36,48,0.02)]"
                                    placeholder="e.g. fashion magazine, coffee cup"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-10 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Composition */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em]">Composition</label>
                                    <InfoTooltip text="How close is the camera to the product?" />
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {Object.entries(SHOT_COMPOSITIONS).map(([key, val]) => (
                                        <GridSelectOption 
                                            key={key}
                                            label={val.name}
                                            isSelected={shotComposition === key}
                                            onClick={() => setShotComposition(key as ShotCompositionKey)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Camera Angle */}
                            <div className="space-y-4">
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] block">Camera Angle</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {Object.entries(CAMERA_ANGLES).map(([key, val]) => (
                                        <GridSelectOption 
                                            key={key}
                                            label={val.name}
                                            isSelected={cameraAngle === key}
                                            onClick={() => setCameraAngle(key as CameraAngleKey)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-boutique-border/50 w-full"></div>

                        {/* Lighting Style */}
                        <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em]">Lighting</label>
                                <InfoTooltip text="Determines the mood and atmosphere." />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(LIGHTING_STYLES).map(([key, val]) => (
                                    <button
                                        key={key}
                                        onClick={() => setLightStyle(key as LightStyleKey)}
                                        className={`px-3 py-4 rounded-[16px] text-[12px] font-semibold transition-all duration-300 border ${
                                            lightStyle === key 
                                                ? 'bg-boutique-blush/50 border-boutique-mauve text-boutique-mauve shadow-[0_2px_8px_rgba(181,106,149,0.08)] ring-1 ring-boutique-mauve/20' 
                                                : 'bg-boutique-ivory border-boutique-border text-boutique-text hover:bg-boutique-bg hover:border-boutique-mauve/40'
                                        }`}
                                    >
                                        {val.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hand Aesthetic (If no model) */}
                        {!modelImage && (
                            <div className="space-y-4">
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] block">Human Touch</label>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(AESTHETIC_HANDS).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => setAestheticHand(key as AestheticHandKey)}
                                            className={`px-5 py-2.5 rounded-full text-[12px] font-medium border transition-all duration-300 ${
                                                aestheticHand === key 
                                                    ? 'bg-boutique-text text-boutique-ivory border-boutique-text shadow-[0_4px_12px_rgba(45,36,48,0.15)]' 
                                                    : 'bg-boutique-ivory text-boutique-text border-boutique-border hover:border-boutique-mauve/40 hover:bg-boutique-bg'
                                            }`}
                                        >
                                            {val.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-10 animate-fadeIn">
                        {/* Aspect Ratio */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] block">Format & Aspect Ratio</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(ASPECT_RATIOS).map(([key, val]) => (
                                    <button
                                        key={key}
                                        onClick={() => setAspectRatio(key as AspectRatioKey)}
                                        className={`flex flex-col items-center justify-center py-5 rounded-[16px] transition-all duration-300 border ${
                                            aspectRatio === key 
                                                ? 'bg-boutique-blush/50 border-boutique-mauve text-boutique-mauve shadow-[0_2px_8px_rgba(181,106,149,0.08)] ring-1 ring-boutique-mauve/20' 
                                                : 'bg-boutique-ivory border-boutique-border text-boutique-muted hover:bg-boutique-bg hover:border-boutique-mauve/40 hover:text-boutique-text'
                                        }`}
                                    >
                                        <div className={`border-2 mb-3 rounded-sm ${aspectRatio === key ? 'border-boutique-mauve' : 'border-boutique-muted/50'} ${
                                            key === '1:1' ? 'w-6 h-6' : 
                                            key === '9:16' ? 'w-5 h-8' : 
                                            key === '16:9' ? 'w-8 h-5' : 'w-6 h-7'
                                        }`} />
                                        <span className="text-[12px] font-semibold">{val.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pastel Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em]">Pastel Intensity</label>
                                <span className="text-[12px] font-semibold text-boutique-mauve bg-boutique-blush/50 px-3 py-1 rounded-full">{pastelLevel}/5</span>
                            </div>
                            <input 
                                type="range" min="1" max="5" 
                                value={pastelLevel} 
                                onChange={(e) => setPastelLevel(parseInt(e.target.value))} 
                                className="w-full h-1.5 bg-boutique-border rounded-lg appearance-none cursor-pointer accent-boutique-mauve"
                            />
                            <div className="flex justify-between text-[10px] font-medium text-boutique-muted px-1">
                                <span>Natural</span>
                                <span>Dreamy</span>
                            </div>
                        </div>

                        {/* Quantity & Language */}
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">Variations</label>
                                <input type="number" min="1" max="4" value={numImages} onChange={(e) => setNumImages(parseInt(e.target.value))} className="w-full bg-boutique-ivory border border-boutique-border/50 rounded-[16px] px-5 py-3.5 text-[13px] text-boutique-text focus:bg-white focus:ring-1 focus:ring-boutique-mauve/30 focus:border-boutique-mauve/50 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(45,36,48,0.02)]"/>
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-3 block">Caption Language</label>
                                <select value={captionLanguage} onChange={(e) => setCaptionLanguage(e.target.value as CaptionLanguageKey)} className="w-full bg-boutique-ivory border border-boutique-border/50 rounded-[16px] px-5 py-3.5 text-[13px] text-boutique-text focus:bg-white focus:ring-1 focus:ring-boutique-mauve/30 focus:border-boutique-mauve/50 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(45,36,48,0.02)] appearance-none">
                                    {Object.entries(CAPTION_LANGUAGES).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        {/* Checkboxes */}
                        <div className="space-y-4 pt-4 border-t border-boutique-border/50">
                             <label className="flex items-center gap-4 p-4 bg-boutique-ivory/50 rounded-[20px] cursor-pointer hover:bg-white hover:shadow-[0_4px_12px_rgba(45,36,48,0.03)] border border-boutique-border/30 transition-all duration-300">
                                <input type="checkbox" checked={excludeText} onChange={(e) => setExcludeText(e.target.checked)} className="w-5 h-5 text-boutique-mauve border-boutique-border rounded focus:ring-boutique-mauve/30 accent-boutique-mauve"/>
                                <span className="text-[13px] text-boutique-text font-medium">Remove original text/logos from product</span>
                            </label>
                            
                            <div className="bg-boutique-ivory/50 p-5 rounded-[20px] border border-boutique-border/30">
                                <label className="text-[11px] font-semibold text-boutique-muted uppercase tracking-[0.2em] mb-4 block">Magic Effects</label>
                                <div className="space-y-3">
                                    {Object.entries(AI_DECORATIONS).map(([key, decoration]) => (
                                        <label key={key} className="flex items-center gap-4 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 ${selectedDecorations.has(key as AiDecorationKey) ? 'bg-boutique-mauve border-boutique-mauve text-white shadow-[0_2px_8px_rgba(181,106,149,0.3)]' : 'bg-white border-boutique-border/80 group-hover:border-boutique-mauve/50'}`}>
                                                {selectedDecorations.has(key as AiDecorationKey) && <Icon name="check" className="w-3.5 h-3.5" />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={selectedDecorations.has(key as AiDecorationKey)} onChange={() => handleDecorationChange(key as AiDecorationKey)} />
                                            <span className="text-[13px] text-boutique-text font-medium group-hover:text-boutique-mauve transition-colors">{decoration.emoji} {decoration.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Bottom Action Bar */}
            <div className="p-6 md:p-8 border-t border-boutique-border/50 bg-boutique-ivory/80 backdrop-blur-xl rounded-b-[32px] flex items-center gap-4">
                 {currentStep > 1 && (
                    <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-6 py-4 rounded-[20px] text-[13px] font-semibold text-boutique-muted hover:bg-boutique-bg hover:text-boutique-text transition-all duration-300 border border-transparent hover:border-boutique-border/50"
                    >
                        Back
                    </button>
                )}
                
                {currentStep < 4 ? (
                    <button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={uploadedImages.length === 0 && currentStep === 1}
                        className="flex-1 bg-boutique-text text-boutique-ivory font-semibold text-[13px] uppercase tracking-[0.15em] py-4 px-8 rounded-[20px] hover:bg-boutique-text/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(45,36,48,0.15)] hover:shadow-[0_12px_32px_rgba(45,36,48,0.2)] hover:-translate-y-0.5"
                    >
                        Continue
                    </button>
                ) : (
                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || uploadedImages.length === 0}
                        className="flex-1 relative group overflow-hidden rounded-[20px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 shadow-[0_8px_24px_rgba(181,106,149,0.25)] hover:shadow-[0_12px_32px_rgba(181,106,149,0.35)] hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-boutique-mauve via-boutique-plum to-boutique-mauve bg-[length:200%_auto] animate-gradient"></div>
                        <div className="relative px-8 py-4 flex items-center justify-center gap-3 text-boutique-ivory font-semibold tracking-wide">
                            {isGenerating ? (
                                <>
                                    <Icon name="loading" className="w-5 h-5 animate-spin" />
                                    <span className="text-[13px] uppercase tracking-[0.15em]">Crafting...</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="magic-wand" className="w-5 h-5" />
                                    <span className="text-[13px] uppercase tracking-[0.15em]">Generate Photos</span>
                                </>
                            )}
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;