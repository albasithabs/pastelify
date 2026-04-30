import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import PreviewPanel from './components/PreviewPanel';
import ScriptGeneratorModal from './components/ScriptGeneratorModal';
import MagicEditModal from './components/MagicEditModal';
import Modal from './components/Modal';
import { generateAestheticImage, generateAffiliateCaptions, generateProductDescriptionFromImage, generateVideoScript, editAestheticImage, generateBackgroundDescriptionFromImage } from './services/geminiService';
import { resizeImageToAspectRatio, resizeImageToMaxDimension } from './utils/imageUtils';
import { 
    LOADING_MESSAGES, 
    CAPTION_LANGUAGES, AI_DECORATIONS, BackgroundThemeKey, CameraAngleKey, LightStyleKey, 
    CaptionLanguageKey, AiDecorationKey, ModelInteractionKey, ShotCompositionKey,
    VideoPlatformKey, VideoStyleKey,
    AestheticHandKey, AspectRatioKey
} from './constants';
import type { GeneratedImage, GenerateImageOptions, VideoScript } from './types';
import Icon from './components/Icon';

const App: React.FC = () => {
    // State for user inputs
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    // NEW: Mode for multi-image generation
    const [generationMode, setGenerationMode] = useState<'single' | 'group'>('single');
    
    const [modelImage, setModelImage] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [productDescription, setProductDescription] = useState<string>('');
    const [isDescribingProduct, setIsDescribingProduct] = useState<boolean>(false);
    const [selectedTheme, setSelectedTheme] = useState<BackgroundThemeKey>('pastelDesk');
    const [cameraAngle, setCameraAngle] = useState<CameraAngleKey>('heroShot');
    const [lightStyle, setLightStyle] = useState<LightStyleKey>('softDaylight');
    const [pastelLevel, setPastelLevel] = useState<number>(3);
    const [numImages, setNumImages] = useState<number>(2);
    const [excludeText, setExcludeText] = useState<boolean>(true);
    const [captionLanguage, setCaptionLanguage] = useState<CaptionLanguageKey>('id');
    const [dominantColors, setDominantColors] = useState<string>('');
    const [extraProps, setExtraProps] = useState<string>('');
    const [selectedDecorations, setSelectedDecorations] = useState<Set<AiDecorationKey>>(new Set());
    const [modelInteraction, setModelInteraction] = useState<ModelInteractionKey>('using');
    const [shotComposition, setShotComposition] = useState<ShotCompositionKey>('medium');
    const [aestheticHand, setAestheticHand] = useState<AestheticHandKey>('none');
    const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>('4:5');
    const [backgroundDescription, setBackgroundDescription] = useState<string>('');
    const [isAnalyzingBackground, setIsAnalyzingBackground] = useState<boolean>(false);

    // State for generation process and results
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
    const [lastGenerationOptions, setLastGenerationOptions] = useState<GenerateImageOptions | null>(null);
    
    // State for script generation
    const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
    const [selectedImageForScript, setSelectedImageForScript] = useState<GeneratedImage | null>(null);
    const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
    const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(null);
    const [scriptError, setScriptError] = useState<string | null>(null);
    
    // State for Magic Edit
    const [isMagicEditModalOpen, setIsMagicEditModalOpen] = useState<boolean>(false);
    const [imageForMagicEdit, setImageForMagicEdit] = useState<GeneratedImage | null>(null);
    const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
    const [magicEditError, setMagicEditError] = useState<string | null>(null);

    // State for stepper layout (controlled by ControlPanel tabs)
    const [currentStep, setCurrentStep] = useState(1);

    const loadingIntervalRef = useRef<number | null>(null);
    const previewSectionRef = useRef<HTMLDivElement>(null);

    // Effect to handle loading messages and auto-scroll
    useEffect(() => {
        if (isGenerating) {
            setLoadingMessage(LOADING_MESSAGES[0]); // Set initial message
            loadingIntervalRef.current = window.setInterval(() => {
                setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
            }, 2500);
            
            // Auto-scroll to preview section when generating starts
            if (previewSectionRef.current) {
                 setTimeout(() => {
                    previewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }, 100);
            }

        } else {
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
            setLoadingMessage('');
        }
        return () => {
            if (loadingIntervalRef.current) {
                clearInterval(loadingIntervalRef.current);
            }
        };
    }, [isGenerating]);

    // Handle uploading multiple images
    const handleImageUpload = useCallback((newImages: string[]) => {
        setUploadedImages(prev => {
            // Combine and limit to 10
            const combined = [...prev, ...newImages];
            return combined.slice(0, 10); 
        });
        
        // If it's the first image being uploaded, clear description and error
        if (uploadedImages.length === 0) {
            setProductDescription('');
            setError(null);
        }
    }, [uploadedImages]);
    
    const handleGenerateAIDescription = useCallback(async () => {
        const activeImage = uploadedImages[activeImageIndex];
        if (!activeImage) return;

        setIsDescribingProduct(true);
        setProductDescription("AI sedang mendeskripsikan produk...");
        setError(null);

        try {
            const mimeTypePart = activeImage.split(';base64,')[0]?.replace('data:', '');
            const base64Data = activeImage.split(';base64,')[1];

            if (!mimeTypePart || !base64Data) {
                throw new Error("Format data gambar tidak valid.");
            }

            const description = await generateProductDescriptionFromImage(base64Data, mimeTypePart);
            setProductDescription(description);

        } catch (err) {
            console.error("Gagal membuat deskripsi:", err);
            setError("Gagal membuat deskripsi otomatis. Mohon isi manual.");
            setProductDescription(''); // Kosongkan deskripsi jika gagal
        } finally {
            setIsDescribingProduct(false);
        }
    }, [uploadedImages, activeImageIndex]);
    
    const handleRemoveUploadedImage = useCallback((indexToRemove: number) => {
        setUploadedImages(prev => {
            const newImages = prev.filter((_, index) => index !== indexToRemove);
            
            // Adjust active index if necessary
            if (indexToRemove === activeImageIndex) {
                 // If removing the currently active image, set active to the previous one, or 0
                 setActiveImageIndex(Math.max(0, indexToRemove - 1));
            } else if (indexToRemove < activeImageIndex) {
                // If removing an image before the active one, shift active index down
                setActiveImageIndex(activeImageIndex - 1);
            }
            
            return newImages;
        });

        if (uploadedImages.length <= 1) {
             setProductDescription("");
             setError(null);
             setCurrentStep(1);
             setGenerationMode('single'); // Reset mode if only 1 image left
        }
    }, [uploadedImages, activeImageIndex]);

    const handleModelImageUpload = useCallback((imageData: string) => {
        setModelImage(imageData);
    }, []);

    const handleRemoveModelImage = useCallback(() => {
        setModelImage(null);
    }, []);

    const handleAnalyzeBackground = useCallback(async (imageData: string) => {
        setIsAnalyzingBackground(true);
        setBackgroundDescription("AI sedang menganalisis latar...");
        try {
            const mimeTypePart = imageData.split(';base64,')[0]?.replace('data:', '');
            const base64Data = imageData.split(';base64,')[1];
            if (!mimeTypePart || !base64Data) throw new Error("Format gambar latar tidak valid.");
            
            const description = await generateBackgroundDescriptionFromImage(base64Data, mimeTypePart);
            setBackgroundDescription(description);
        } catch (err) {
            console.error("Gagal menganalisis latar:", err);
            setBackgroundDescription("Gagal menganalisis latar. Deskripsi manual mungkin diperlukan.");
        } finally {
            setIsAnalyzingBackground(false);
        }
    }, []);

    const handleBackgroundImageUpload = useCallback((imageData: string) => {
        setBackgroundImage(imageData);
        handleAnalyzeBackground(imageData);
    }, [handleAnalyzeBackground]);

    const handleRemoveBackgroundImage = useCallback(() => {
        setBackgroundImage(null);
        setBackgroundDescription('');
    }, []);

    const handleGenerate = useCallback(async () => {
        if (uploadedImages.length === 0 || isGenerating) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedImages([]);
        setGeneratedCaptions([]);
        
        try {
            let productBase64Images: string[] = [];
            let productMimeTypes: string[] = [];

            // MODE HANDLING
            if (generationMode === 'group' && uploadedImages.length > 1) {
                 // GROUP MODE: Process all uploaded images
                 // We use resizeImageToMaxDimension to preserve product details (Fit instead of Crop)
                 const processedImages = await Promise.all(
                     uploadedImages.map(img => resizeImageToMaxDimension(img, 1024))
                 );
                 productBase64Images = processedImages.map(p => p.resizedBase64.split(';base64,')[1]);
                 productMimeTypes = processedImages.map(p => p.mimeType);
            } else {
                // SINGLE MODE: Process only active image
                const currentActiveImage = uploadedImages[activeImageIndex];
                if (!currentActiveImage) throw new Error("No active image selected.");
                
                // For single image, we use resizeToAspectRatio (Crop) to match output
                const processed = await resizeImageToAspectRatio(currentActiveImage, aspectRatio);
                productBase64Images = [processed.resizedBase64.split(';base64,')[1]];
                productMimeTypes = [processed.mimeType];
            }

            const options: GenerateImageOptions = {
                productBase64Images,
                productMimeTypes,
                productDescription,
                theme: selectedTheme,
                cameraAngle: cameraAngle,
                lightStyle: lightStyle,
                composition: shotComposition,
                pastelLevel: pastelLevel,
                excludeText,
                decorationPrompt: Array.from(selectedDecorations)
                    .map(key => AI_DECORATIONS[key as AiDecorationKey].prompt)
                    .join(' '),
                dominantColorsPrompt: dominantColors.trim(),
                extraPropsPrompt: extraProps.trim(),
                aestheticHand,
                aspectRatio,
            };
            
            if (modelImage) {
                const { resizedBase64: resizedModelBase64, mimeType: modelMimeType } = await resizeImageToAspectRatio(modelImage, aspectRatio);
                options.modelBase64Image = resizedModelBase64.split(';base64,')[1];
                options.modelMimeType = modelMimeType;
                options.interaction = modelInteraction;
            }

            if (backgroundImage) {
                const { resizedBase64: resizedBackgroundBase64, mimeType: backgroundMimeType } = await resizeImageToAspectRatio(backgroundImage, aspectRatio);
                options.backgroundBase64Image = resizedBackgroundBase64.split(';base64,')[1];
                options.backgroundMimeType = backgroundMimeType;
                options.backgroundDescription = backgroundDescription;
            }

            setLastGenerationOptions(options);

            const imagePromises = Array.from({ length: numImages }).map((_, index) => generateAestheticImage(options, index));
            const languageName = CAPTION_LANGUAGES[captionLanguage];
            const captionPromise = productDescription ? generateAffiliateCaptions(productDescription, languageName) : Promise.resolve([]);

            const [imageResults, captions] = await Promise.all([
                Promise.all(imagePromises),
                captionPromise,
            ]);

            setGeneratedImages(imageResults.map((src, index) => ({ id: `${Date.now()}-${Math.random()}`, src, variantIndex: index })));
            setGeneratedCaptions(captions);

        } catch (err) {
            console.error(err);
            let message = "Terjadi kesalahan yang tidak diketahui saat generasi.";
            if (err instanceof Error) {
                message = err.message;
            } else if (typeof err === 'string') {
                message = err;
            }
            setError(message);
        } finally {
            setIsGenerating(false);
        }

    }, [
        uploadedImages, activeImageIndex, generationMode, // Added generationMode dependency
        modelImage, backgroundImage, productDescription, selectedTheme, cameraAngle,
        lightStyle, pastelLevel, numImages, excludeText, isGenerating,
        captionLanguage, dominantColors, extraProps, selectedDecorations,
        modelInteraction, shotComposition, aestheticHand, aspectRatio, backgroundDescription
    ]);

    const handleRegenerate = useCallback(async (imageId: string) => {
        const imageToRegenerate = generatedImages.find(img => img.id === imageId);
        if (!lastGenerationOptions || !imageToRegenerate) {
            setError("Opsi generasi sebelumnya tidak ditemukan.");
            return;
        }

        setGeneratedImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, isRegenerating: true } : img
        ));
        setError(null);

        try {
            const newImageSrc = await generateAestheticImage(lastGenerationOptions, imageToRegenerate.variantIndex);
            setGeneratedImages(prev => prev.map(img =>
                img.id === imageId ? { ...img, src: newImageSrc, isRegenerating: false } : img
            ));
        } catch (err) {
            console.error("Gagal me-regenerasi gambar:", err);
            setError("Gagal me-regenerasi gambar. Silakan coba lagi.");
            setGeneratedImages(prev => prev.map(img =>
                img.id === imageId ? { ...img, isRegenerating: false } : img
            ));
        }
    }, [lastGenerationOptions, generatedImages]);
    
    const handleOpenMagicEditModal = useCallback((imageId: string) => {
        const image = generatedImages.find(img => img.id === imageId);
        if (image) {
            setImageForMagicEdit(image);
            setMagicEditError(null);
            setIsMagicEditModalOpen(true);
        }
    }, [generatedImages]);

    const handleCloseMagicEditModal = useCallback(() => {
        setIsMagicEditModalOpen(false);
        setTimeout(() => setImageForMagicEdit(null), 300);
    }, []);

    const handleExecuteMagicEdit = useCallback(async (editPrompt: string) => {
        if (!imageForMagicEdit) {
            setMagicEditError("No image selected for editing.");
            return;
        }

        setIsEditingImage(true);
        setMagicEditError(null);

        try {
            const mimeType = imageForMagicEdit.src.split(';base64,')[0].replace('data:', '');
            const base64Image = imageForMagicEdit.src.split(';base64,')[1];
            
            const newImageSrc = await editAestheticImage(base64Image, mimeType, editPrompt);
            
            setGeneratedImages(prev => prev.map(img => 
                img.id === imageForMagicEdit.id ? { ...img, src: newImageSrc } : img
            ));
            
            handleCloseMagicEditModal();

        } catch (err) {
            console.error("Failed to edit image:", err);
            const message = err instanceof Error ? err.message : "An unknown error occurred during edit.";
            setMagicEditError(message);
        } finally {
            setIsEditingImage(false);
        }
    }, [imageForMagicEdit, handleCloseMagicEditModal]);

    const handleOpenScriptModal = useCallback((imageId: string) => {
        const image = generatedImages.find(img => img.id === imageId);
        if (image) {
            setSelectedImageForScript(image);
            setGeneratedScript(null);
            setScriptError(null);
            setIsScriptModalOpen(true);
        }
    }, [generatedImages]);

    const handleCloseScriptModal = useCallback(() => {
        setIsScriptModalOpen(false);
        setSelectedImageForScript(null);
    }, []);

    const handleGenerateScript = useCallback(async (options: { platform: VideoPlatformKey, style: VideoStyleKey, duration: number, keyMessage: string }) => {
        if (!selectedImageForScript || !productDescription) {
            setScriptError("Missing product information to generate script.");
            return;
        }

        setIsGeneratingScript(true);
        setGeneratedScript(null);
        setScriptError(null);

        try {
            const mimeType = selectedImageForScript.src.split(';base64,')[0].replace('data:', '');
            const base64Image = selectedImageForScript.src.split(';base64,')[1];

            const script = await generateVideoScript({
                ...options,
                productDescription,
                base64Image,
                mimeType,
            });
            setGeneratedScript(script);
        } catch (err) {
            console.error("Failed to generate script:", err);
            setScriptError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsGeneratingScript(false);
        }

    }, [selectedImageForScript, productDescription]);

    const handleClearScript = useCallback(() => {
        setGeneratedScript(null);
        setScriptError(null);
    }, []);

    const handleNextPreview = () => {
        if (previewImageIndex !== null) {
            setPreviewImageIndex((previewImageIndex + 1) % generatedImages.length);
        }
    };

    const handlePrevPreview = () => {
        if (previewImageIndex !== null) {
            setPreviewImageIndex((previewImageIndex - 1 + generatedImages.length) % generatedImages.length);
        }
    };

    return (
        <div className="min-h-screen font-sans">
            <Header />
            
            <main className="container mx-auto p-4 pb-20 md:p-6 max-w-7xl">
                <div className="mt-4 lg:mt-8 flex flex-col lg:grid lg:grid-cols-[minmax(0,_5fr)_4fr] gap-6 lg:gap-8 items-start">
                    
                    {/* Left Panel for Controls */}
                    <div className="w-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-0 overflow-hidden flex flex-col min-h-[600px]">
                        <ControlPanel
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            
                            uploadedImages={uploadedImages}
                            activeImageIndex={activeImageIndex}
                            onImageUpload={handleImageUpload}
                            onRemoveUploadedImage={handleRemoveUploadedImage}
                            setActiveImageIndex={setActiveImageIndex}
                            // NEW Props
                            generationMode={generationMode}
                            setGenerationMode={setGenerationMode}

                            onGenerateAIDescription={handleGenerateAIDescription}
                            
                            modelImage={modelImage}
                            onModelImageUpload={handleModelImageUpload}
                            onRemoveModelImage={handleRemoveModelImage}
                            backgroundImage={backgroundImage}
                            onBackgroundImageUpload={handleBackgroundImageUpload}
                            onRemoveBackgroundImage={handleRemoveBackgroundImage}
                            productDescription={productDescription}
                            setProductDescription={setProductDescription}
                            isDescribingProduct={isDescribingProduct}
                            selectedTheme={selectedTheme}
                            setSelectedTheme={setSelectedTheme}
                            cameraAngle={cameraAngle}
                            setCameraAngle={setCameraAngle}
                            lightStyle={lightStyle}
                            setLightStyle={setLightStyle}
                            pastelLevel={pastelLevel}
                            setPastelLevel={setPastelLevel}
                            numImages={numImages}
                            setNumImages={setNumImages}
                            excludeText={excludeText}
                            setExcludeText={setExcludeText}
                            captionLanguage={captionLanguage}
                            setCaptionLanguage={setCaptionLanguage}
                            dominantColors={dominantColors}
                            setDominantColors={setDominantColors}
                            extraProps={extraProps}
                            setExtraProps={setExtraProps}
                            selectedDecorations={selectedDecorations}
                            setSelectedDecorations={setSelectedDecorations}
                            modelInteraction={modelInteraction}
                            setModelInteraction={setModelInteraction}
                            shotComposition={shotComposition}
                            setShotComposition={setShotComposition}
                            aestheticHand={aestheticHand}
                            setAestheticHand={setAestheticHand}
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                            backgroundDescription={backgroundDescription}
                            isAnalyzingBackground={isAnalyzingBackground}
                        />
                    </div>

                    {/* Right/Bottom Panel for Preview */}
                    <div 
                        ref={previewSectionRef}
                        className="w-full lg:sticky lg:top-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 transition-all"
                    >
                         <PreviewPanel
                            generatedImages={generatedImages}
                            isGenerating={isGenerating}
                            loadingMessage={loadingMessage}
                            error={error}
                            captions={generatedCaptions}
                            onRegenerate={handleRegenerate}
                            onGenerateScript={handleOpenScriptModal}
                            onOpenMagicEditModal={handleOpenMagicEditModal}
                            onPreview={setPreviewImageIndex}
                        />
                         <div className="mt-6 text-center hidden lg:block">
                            <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                                <Icon name="logo" className="w-4 h-4 opacity-50"/>
                                Fluxio Pastelify
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Modals - Rendered at Root Level to prevent Stacking Context Issues */}
            <Modal 
                isOpen={previewImageIndex !== null} 
                onClose={() => setPreviewImageIndex(null)} 
                title="Full Preview"
                images={generatedImages.map(img => img.src)}
                currentIndex={previewImageIndex ?? 0}
                onNext={handleNextPreview}
                onPrev={handlePrevPreview}
            />

            {selectedImageForScript && (
                <ScriptGeneratorModal
                    isOpen={isScriptModalOpen}
                    onClose={handleCloseScriptModal}
                    imageSrc={selectedImageForScript.src}
                    productDescription={productDescription}
                    onGenerate={handleGenerateScript}
                    onRegenerateRequest={handleClearScript}
                    isGenerating={isGeneratingScript}
                    generatedScript={generatedScript}
                    error={scriptError}
                />
            )}
             <MagicEditModal
                isOpen={isMagicEditModalOpen}
                onClose={handleCloseMagicEditModal}
                imageSrc={imageForMagicEdit?.src ?? null}
                onEdit={handleExecuteMagicEdit}
                isEditing={isEditingImage}
                error={magicEditError}
            />
        </div>
    );
};

export default App;