import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    images: string[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, images, currentIndex, onNext, onPrev }) => {
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const modalContentRef = useRef<HTMLDivElement>(null);

    const resetTransform = () => {
        setTransform({ scale: 1, x: 0, y: 0 });
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        setTransform({ scale: 1, x: 0, y: 0 });
        onClose();
    };

    const handleNext = () => {
        setTransform({ scale: 1, x: 0, y: 0 });
        onNext();
    };

    const handlePrev = () => {
        setTransform({ scale: 1, x: 0, y: 0 });
        onPrev();
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = 0.1;
        const newScale = e.deltaY > 0
            ? Math.max(transform.scale - scaleAmount, 0.5)
            : Math.min(transform.scale + scaleAmount, 5);
        
        setTransform(prev => ({...prev, scale: newScale}));
    };
    
    const handleMouseDown = (e: React.MouseEvent) => {
        if (transform.scale <= 1) return;
        e.preventDefault();
        setIsDragging(true);
        setStartPos({
            x: e.clientX - transform.x,
            y: e.clientY - transform.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        setTransform(prev => ({
            ...prev,
            x: e.clientX - startPos.x,
            y: e.clientY - startPos.y,
        }));
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };
    
    const handleZoomIn = () => setTransform(prev => ({...prev, scale: Math.min(prev.scale + 0.2, 5)}));
    const handleZoomOut = () => setTransform(prev => ({...prev, scale: Math.max(prev.scale - 0.2, 0.5)}));


    if (!isOpen || images.length === 0) return null;

    const imageCursor = isDragging ? 'grabbing' : (transform.scale > 1 ? 'grab' : 'default');

    return (
        <div 
            className="fixed inset-0 z-[9999] flex flex-col bg-boutique-bg/95 backdrop-blur-xl h-[100dvh] w-screen"
            onClick={handleClose}
        >
            {/* Header */}
            <div className="flex-none flex justify-between items-center px-6 py-6 z-50 bg-gradient-to-b from-boutique-bg/80 to-transparent text-boutique-text">
                <h2 className="text-[13px] font-semibold tracking-[0.15em] uppercase drop-shadow-md flex items-center gap-2">
                    <Icon name="preview" className="w-4 h-4 text-boutique-mauve" />
                    {title} <span className="text-boutique-muted/80 ml-2">({currentIndex + 1}/{images.length})</span>
                </h2>
                <button onClick={handleClose} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-all border border-white/10">
                    <Icon name="close" className="w-5 h-5 text-boutique-text" />
                </button>
            </div>
            
            {/* Image Area - Flex 1 ensures it takes remaining space */}
            <div 
                ref={modalContentRef}
                className="flex-1 w-full relative overflow-hidden flex items-center justify-center p-4 md:p-8"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                onClick={(e) => e.stopPropagation()}
            >
                <img 
                    src={images[currentIndex]} 
                    alt={`Preview ${currentIndex + 1}`} 
                    className="max-w-full max-h-full object-contain transition-transform duration-100 select-none shadow-[0_24px_80px_rgba(0,0,0,0.4)] rounded-[12px]"
                    style={{ 
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        cursor: imageCursor,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    draggable={false}
                />

                {/* Controls Floating at Bottom Center of Image Area */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-50 bg-boutique-ivory/80 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                     <button onClick={handleZoomOut} disabled={transform.scale <= 0.5} className="text-boutique-text/70 hover:text-boutique-mauve transition-colors disabled:opacity-30"><Icon name="zoom-out" className="w-5 h-5"/></button>
                     <button onClick={resetTransform} className="text-boutique-text/70 hover:text-boutique-mauve transition-colors"><Icon name="zoom-reset" className="w-5 h-5"/></button>
                     <button onClick={handleZoomIn} className="text-boutique-text/70 hover:text-boutique-mauve transition-colors"><Icon name="zoom-in" className="w-5 h-5"/></button>
                </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-boutique-ivory/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-boutique-text hover:bg-boutique-border transition-all duration-300 z-[100] shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-105"
                    >
                        <Icon name="arrow-left" className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-boutique-ivory/50 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-boutique-text hover:bg-boutique-border transition-all duration-300 z-[100] shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:scale-105"
                    >
                        <Icon name="arrow-right" className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </>
            )}
        </div>
    );
};

export default Modal;