
import React from 'react';
import Icon from './Icon';

interface ToSModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ToSModal: React.FC<ToSModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-boutique-text/40 backdrop-blur-sm transition-opacity" />

            {/* Modal Content */}
            <div 
                className="relative bg-boutique-ivory rounded-[32px] shadow-[0_24px_80px_rgba(45,36,48,0.15)] w-full max-w-2xl flex flex-col overflow-hidden max-h-[85vh] animate-fadeIn border border-boutique-border/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-boutique-border/50 flex justify-between items-center bg-boutique-bg/50 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-3 text-boutique-text">
                        <Icon name="check" className="w-5 h-5 text-boutique-mauve" />
                        <h2 className="text-xl font-heading font-semibold tracking-tight">Terms of Service & License</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2.5 bg-boutique-ivory hover:bg-boutique-blush rounded-full text-boutique-muted hover:text-boutique-mauve transition-colors shadow-sm"
                    >
                        <Icon name="close" className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 overflow-y-auto text-[13px] text-boutique-text leading-relaxed space-y-8 custom-scrollbar">
                    
                    <section>
                        <h3 className="text-boutique-text font-heading font-semibold mb-3 flex items-center gap-2 text-base">
                            1. License Grant
                        </h3>
                        <p className="text-boutique-muted">
                            <strong>Pastelify Studio</strong> ("Software") grants you a limited, non-exclusive, non-transferable license to use this application for content creation purposes (personal or commercial).
                        </p>
                    </section>

                    <section className="bg-red-50/50 p-6 rounded-[24px] border border-red-100">
                        <h3 className="text-red-800 font-heading font-semibold mb-3 flex items-center gap-2 text-base">
                            ⚠️ 2. Strict Prohibition on Resale
                        </h3>
                        <p className="text-red-700/90 mb-3 font-medium">
                            You are <strong className="font-bold">STRICTLY PROHIBITED</strong> from:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-red-700/80">
                            <li>Copying, cloning, or modifying the Source Code of this application.</li>
                            <li>Reselling access to the application or Source Code to third parties illegally.</li>
                            <li>Reverse Engineering the AI prompt logic used.</li>
                            <li>Distributing this application as your own SaaS product (White-labeling) without written permission.</li>
                        </ul>
                    </section>

                    <section className="bg-boutique-blush/30 p-6 rounded-[24px] border border-boutique-mauve/20">
                         <h3 className="text-boutique-mauve font-heading font-semibold mb-3 flex items-center gap-2 text-base">
                            🤝 3. Official Affiliate Program
                        </h3>
                        <div className="text-boutique-text space-y-3">
                            <p>
                                Want to earn income by selling access to Pastelify Studio? <strong className="font-semibold text-boutique-mauve">Let's partner legally!</strong>
                            </p>
                            <p className="text-boutique-muted">
                                We offer opportunities for you to resell or promote this application through official channels:
                            </p>
                            <div className="bg-boutique-ivory p-4 rounded-[16px] border border-boutique-border/50 my-4 text-center shadow-[0_4px_12px_rgba(45,36,48,0.02)]">
                                <span className="block text-[10px] text-boutique-muted uppercase tracking-[0.2em] font-semibold mb-1.5">Official Platform</span>
                                <span className="text-lg font-heading font-bold text-boutique-text tracking-tight">Lynk.id/Pastelify</span>
                            </div>
                            <p className="text-boutique-muted">
                                <strong className="text-boutique-text font-semibold">How to Join:</strong> Please contact the developer to <em className="italic">Request Affiliate</em> status. You will receive a legitimate referral link. This way, you earn clear, legal commissions fully supported by us.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-boutique-text font-heading font-semibold mb-3 text-base">4. Intellectual Property</h3>
                        <p className="text-boutique-muted">
                            All intellectual property rights, including but not limited to source code, user interface design (UI/UX), and prompt engineering algorithms, are the exclusive property of the <strong>Pastelify Studio</strong> developers. Violations of these rights will be prosecuted to the fullest extent of the law.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-boutique-text font-heading font-semibold mb-3 text-base">5. Usage of AI Outputs</h3>
                        <p className="text-boutique-muted">
                            You have full rights to the <strong>images and content</strong> you generate using this application. You are free to use them for affiliate marketing, social media, or commercial purposes without paying additional royalties.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-boutique-text font-heading font-semibold mb-3 text-base">6. Disclaimer</h3>
                        <p className="text-boutique-muted">
                            This application utilizes Artificial Intelligence technology. Generated results may vary. We are not responsible for visual misinterpretations by the AI.
                        </p>
                    </section>

                    <div className="pt-6 border-t border-boutique-border/50 text-[11px] text-boutique-muted/60 text-center uppercase tracking-[0.1em] font-semibold">
                        Last Updated: March 2026 &bull; Pastelify Studio Legal Team
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-boutique-border/50 bg-boutique-bg/30 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="relative group overflow-hidden rounded-[20px] transition-all duration-500 shadow-[0_8px_24px_rgba(181,106,149,0.25)] hover:shadow-[0_12px_32px_rgba(181,106,149,0.35)] hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-boutique-mauve via-boutique-plum to-boutique-mauve bg-[length:200%_auto] animate-gradient"></div>
                        <div className="relative px-8 py-3.5 flex items-center justify-center gap-3 text-boutique-ivory font-semibold tracking-wide">
                            <span className="text-[13px] uppercase tracking-[0.15em]">I Understand & Agree</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToSModal;
