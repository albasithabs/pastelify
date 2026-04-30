
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateImageOptions, GenerateScriptOptions, VideoScript } from "../types";
import { BACKGROUND_THEMES, CAMERA_ANGLES, LIGHTING_STYLES, MODEL_INTERACTIONS, SHOT_COMPOSITIONS, PASTEL_LEVELS, VIDEO_PLATFORMS, VIDEO_STYLES, AESTHETIC_HANDS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Predefined unique variants for subsequent image generations (after the first one)
const VARIANTS = [
    { angleKey: 'straightOn', compositionKey: 'medium', lightKey: 'warmMorning', modelAction: 'Model harus melakukan interaksi inti sambil melihat langsung ke kamera dengan senyum lembut dan percaya diri.' },
    { angleKey: 'heroShot', compositionKey: 'closeUp', lightKey: 'softDaylight', modelAction: 'Model harus melakukan interaksi inti sambil melihat ke samping dengan ekspresi задумчиво, seolah-olah tenggelam dalam momen yang menyenangkan.' },
    { angleKey: 'topView', compositionKey: 'full', lightKey: 'coolMinimal', modelAction: 'Model harus menunjukkan interaksi inti dengan ekspresi ceria, seolah-olah sedang merekam vlog.' },
    { angleKey: 'straightOn', compositionKey: 'closeUp', lightKey: 'warmMorning', modelAction: 'Model harus memegang produk di dekat wajahnya, dengan fokus pada tekstur produk dan ekspresi puas model.' },
    { angleKey: 'heroShot', compositionKey: 'medium', lightKey: 'coolMinimal', modelAction: 'Model melakukan interaksi inti dengan postur yang elegan dan dinamis, menunjukkan sisi modern produk.' },
];


export const generateProductDescriptionFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const prompt = `Analyze the product in this image. Provide a short, clear, and concise description in 4-6 words, suitable for an e-commerce context. For example: 'Pastel Edition Water Bottle' or 'Pink wireless headphones'. Describe only the main product.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
    });

    const description = response.text.trim();
    if (!description) {
        throw new Error("Could not generate a product description from the image.");
    }
    return description;
};

export const generateBackgroundDescriptionFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    const prompt = `Analyze the scene in this image. Describe it as a creative prompt for an AI image generator. Focus on the mood, lighting, colors, key objects, and overall aesthetic in a single, flowing sentence. For example: 'A chic marble vanity with elegant perfume bottles, gold jewelry, and soft studio lighting, creating a luxurious and sophisticated atmosphere.'`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
    });

    const description = response.text.trim();
    if (!description) {
        throw new Error("Could not generate a background description from the image.");
    }
    return description;
};


export const generateAestheticImage = async (options: GenerateImageOptions, variantIndex: number): Promise<string> => {
    const {
        productBase64Images,
        productMimeTypes,
        theme,
        cameraAngle,
        lightStyle,
        composition,
        pastelLevel,
        excludeText,
        decorationPrompt,
        dominantColorsPrompt,
        extraPropsPrompt,
        modelBase64Image,
        modelMimeType,
        interaction,
        aestheticHand,
        backgroundBase64Image,
        backgroundMimeType,
        backgroundDescription,
    } = options;

    let variant;
    // The first image (index 0) uses the exact UI settings.
    // Subsequent images cycle through the predefined VARIANTS array.
    if (variantIndex === 0) {
        variant = {
            angleKey: cameraAngle,
            compositionKey: composition,
            lightKey: lightStyle,
            modelAction: 'Model harus melakukan interaksi inti sambil melihat ke arah kamera dengan ekspresi natural dan menyenangkan.'
        };
    } else {
        variant = VARIANTS[(variantIndex - 1) % VARIANTS.length];
    }
    
    const pastelPrompt = PASTEL_LEVELS.find(p => p.level === pastelLevel)?.prompt || '';
    const isGroupShot = productBase64Images.length > 1;
    
    // --- CORE PROMPT ELEMENTS ---
    const coreInteractionPrompt = interaction && modelBase64Image ? MODEL_INTERACTIONS[interaction].prompt : '';
    const coreBackgroundPrompt = backgroundBase64Image && backgroundDescription
      ? `Gunakan gambar referensi latar belakang sebagai panduan visual yang kuat untuk menciptakan suasana, pencahayaan, dan komposisi, selaras dengan deskripsi berikut: "${backgroundDescription}". Tempatkan produk dari gambar referensi produk secara mulus ke dalam lingkungan ini.`
      : BACKGROUND_THEMES[theme].prompt;
      
    const aestheticHandPrompt = (!modelBase64Image && aestheticHand && aestheticHand !== 'none')
        ? AESTHETIC_HANDS[aestheticHand].prompt
        : '';
    
    const noHumanPrompt = (!modelBase64Image && aestheticHand === 'none') 
        ? 'PENTING: Jangan sertakan figur manusia, model, atau orang dalam gambar. Fokus hanya pada produk dan lingkungan sekitarnya.' 
        : '';


    const modelInstructions = modelBase64Image ? `
Instruksi Model: Sebuah model, yang sangat cocok dengan orang di gambar referensi model, sedang berinteraksi dengan produk.
Integritas Model: Fitur wajah, rambut, dan penampilan umum model harus dipertahankan dengan sempurna dari gambar referensinya.
Interaksi Inti: ${coreInteractionPrompt}` : '';

    const productFocusPrompt = isGroupShot 
        ? `MODE GRUP/KOMPOSISI: Gambar-gambar referensi produk yang dilampirkan menunjukkan beberapa item (atau variasi). Tugas Anda adalah membuat satu komposisi artistik (seperti flatlay, grup shot, atau susunan rak) yang menampilkan SEMUA produk/variasi ini bersama-sama secara harmonis dan aesthetic.`
        : `Tugas: Buat foto gaya hidup sinematik berkualitas tinggi untuk produk tunggal ini.`;

    const finalPrompt = `
${productFocusPrompt}
Rasio aspek gambar output harus dipertahankan sesuai permintaan.
Stabilitas Visual: Pastikan produk berdiri tegak atau diletakkan secara stabil dan natural.
${modelInstructions}
${aestheticHandPrompt ? `Instruksi Tangan: ${aestheticHandPrompt}` : ''}
${noHumanPrompt}
Latar Inti: Adegan diatur sesuai dengan tema berikut: ${coreBackgroundPrompt}.
${dominantColorsPrompt ? `Aksen Warna Dominan: ${dominantColorsPrompt}` : ''}
${extraPropsPrompt ? `Properti Tambahan: ${extraPropsPrompt}` : ''}
Integritas Produk: Penampilan, merek, dan detail produk (dari gambar referensi produk) harus dipertahankan dengan sempurna.

---
VARIAN UNIK UNTUK BIDIKAN INI:
Sudut Kamera: ${CAMERA_ANGLES[variant.angleKey].prompt}
Komposisi: ${SHOT_COMPOSITIONS[variant.compositionKey].prompt}
Pencahayaan: ${LIGHTING_STYLES[variant.lightKey].prompt}
${modelBase64Image ? `Aksi Model: ${variant.modelAction}`: ''}
Intensitas Pastel: ${pastelPrompt}
${decorationPrompt ? `Sentuhan Ajaib: ${decorationPrompt}` : ''}
---

Instruksi Akhir: Hasilkan HANYA gambar. Jangan sertakan teks, komentar, atau penjelasan apa pun. ${excludeText ? 'Gambar harus bersih total, tanpa watermark, logo, atau elemen teks apa pun.' : ''}
`;

    // Construct Parts
    const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [];

    // Add all product images
    productBase64Images.forEach((b64, index) => {
        parts.push({
            inlineData: { mimeType: productMimeTypes[index], data: b64 },
        });
    });

    if (modelBase64Image && modelMimeType) {
        parts.push({
            inlineData: { mimeType: modelMimeType, data: modelBase64Image },
        });
    }

    if (backgroundBase64Image && backgroundMimeType) {
        parts.push({
            inlineData: { mimeType: backgroundMimeType, data: backgroundBase64Image },
        });
    }

    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No image was generated by the API.");
};

export const editAestheticImage = async (base64Image: string, mimeType: string, editPrompt: string): Promise<string> => {
    if (!editPrompt.trim()) {
        throw new Error("Edit prompt cannot be empty.");
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
                { text: editPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No image was generated by the API during edit.");
};


export const generateAffiliateCaptions = async (productDescription: string, languageName: string): Promise<string[]> => {
    const prompt = `
You are an expert affiliate marketing content creator for platforms like TikTok and Shopee. Your style is cute, aesthetic, and engaging.
Generate 3 distinct caption templates in ${languageName} for the following product. Each caption should be ready to copy and paste. Use relevant emojis.

Product: ${productDescription}

Return the response as a JSON array of strings.
`;
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                }
            }
        }
    });

    try {
        const jsonString = response.text;
        const captions = JSON.parse(jsonString);
        if (Array.isArray( captions ) && captions.every(c => typeof c === 'string')) {
            return captions;
        }
        throw new Error("Invalid caption format from API.");
    } catch (e) {
        console.error("Failed to parse captions:", response.text, e);
        throw new Error("Could not parse the captions from the AI. Please try again.");
    }
};

export const generateVideoScript = async (options: GenerateScriptOptions): Promise<VideoScript> => {
    const { productDescription, platform, style, duration, keyMessage, base64Image, mimeType } = options;

    const platformName = VIDEO_PLATFORMS[platform].name;
    const stylePrompt = VIDEO_STYLES[style].prompt;

    const prompt = `
    You are an expert short-form video scriptwriter for affiliate creators on platforms like TikTok and Shopee Video. Your style is trendy, aesthetic, and optimized for engagement.

    Task: Generate a structured video script in Bahasa Indonesia based on the provided product image and details.

    Product Description: ${productDescription}
    Target Platform: ${platformName}
    Video Style: ${stylePrompt}
    Total Duration: ${duration} seconds.
    Key Message to Include (if any): ${keyMessage || 'None'}

    Instructions:
    1.  Create a scene-by-scene breakdown that fits the total duration.
    2.  For each scene, provide:
        a. A clear visual direction.
        b. Suggested on-screen text.
        c. An engaging voice-over narration for the creator to speak.
    3.  Suggest a trending or suitable audio/sound type.
    4.  Provide relevant hashtags for the platform.
    5.  The output MUST be a valid JSON object following the provided schema.

    The final script should feel natural, visually appealing, and guide the creator to make an effective video with the product shown in the image.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: prompt },
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recommendedAudio: { type: Type.STRING, description: "Trending audio or music style recommendation. e.g., 'Ghibli-style piano music' or 'Trending Sound: [Song Title]'." },
                    scenes: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                duration: { type: Type.STRING, description: "Duration for this scene, e.g., 'Detik 0-3'." },
                                type: { type: Type.STRING, description: "Type of the scene, e.g., 'HOOK', 'SHOWCASE', 'VALUE', 'CALL TO ACTION'." },
                                visual: { type: Type.STRING, description: "Visual direction for the creator." },
                                onScreenText: { type: Type.STRING, description: "Text to display on the screen for this scene." },
                                narration: { type: Type.STRING, description: "Engaging voice-over narration for the creator to speak during this scene." },
                            },
                            required: ["duration", "type", "visual", "onScreenText", "narration"]
                        }
                    },
                    hashtags: { type: Type.STRING, description: "A string of relevant hashtags, e.g., '#shopeehaul #racunshopee'." }
                },
                required: ["recommendedAudio", "scenes", "hashtags"]
            }
        }
    });

    try {
        const jsonString = response.text;
        const script = JSON.parse(jsonString);
        // Basic validation
        if (script && Array.isArray(script.scenes)) {
            return script as VideoScript;
        }
        throw new Error("Invalid script format from API.");
    } catch (e) {
        console.error("Failed to parse script:", response.text, e);
        throw new Error("Could not parse the video script from the AI. Please try again.");
    }
};
