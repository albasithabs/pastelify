import React, { useState } from 'react';
import Icon from './Icon';
import ToSModal from './ToSModal';

const Header: React.FC = () => {
    const [isToSOpen, setIsToSOpen] = useState(false);

    return (
        <>
            <header className="bg-white border-b border-boutique-border px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 text-boutique-mauve flex items-center justify-center">
                        <Icon name="logo" className="w-8 h-8"/>
                    </div>
                    <h1 className="text-xl font-heading font-semibold text-boutique-text tracking-tight">
                        Pastelify
                    </h1>
                </div>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => setIsToSOpen(true)}
                        className="text-sm font-medium text-boutique-muted hover:text-boutique-text transition-colors"
                    >
                        Terms of Service
                    </button>
                    <button className="text-boutique-muted hover:text-boutique-text transition-colors">
                        <Icon name="info" className="w-5 h-5"/>
                    </button>
                </div>
            </header>

            <ToSModal isOpen={isToSOpen} onClose={() => setIsToSOpen(false)} />
        </>
    );
};

export default Header;