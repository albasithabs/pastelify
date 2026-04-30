
// FIX: Key-based types have been moved to constants.ts to be co-located with their values.
// This avoids potential tooling confusion and module resolution issues.
import type { BackgroundThemeKey, CameraAngleKey, LightStyleKey, ModelInteractionKey, ShotCompositionKey, VideoPlatformKey, VideoStyleKey, AestheticHandKey, AspectRatioKey } from "./constants";

export interface GeneratedImage {
    id: string;
    src: string;
    isRegenerating?: boolean;
    variantIndex: number;
}

export interface GenerateImageOptions {
    // CHANGED: Supports multiple images now
    productBase64Images: string[];
    productMimeTypes: string[];
    
    productDescription: string;
    theme: BackgroundThemeKey;
    cameraAngle: CameraAngleKey;
    lightStyle: LightStyleKey;
    composition: ShotCompositionKey;
    pastelLevel: number;
    excludeText: boolean;
    decorationPrompt: string;
    dominantColorsPrompt: string;
    extraPropsPrompt: string;
    modelBase64Image?: string;
    modelMimeType?: string;
    interaction?: ModelInteractionKey;
    aestheticHand: AestheticHandKey;
    aspectRatio: AspectRatioKey;
    backgroundBase64Image?: string;
    backgroundMimeType?: string;
    backgroundDescription?: string;
}

export interface VideoScript {
    recommendedAudio: string;
    scenes: {
        duration: string;
        type: string;
        visual: string;
        onScreenText: string;
        narration: string;
    }[];
    hashtags: string;
}

export interface GenerateScriptOptions {
    productDescription: string;
    base64Image: string;
    mimeType: string;
    platform: VideoPlatformKey;
    style: VideoStyleKey;
    duration: number;
    keyMessage?: string;
}