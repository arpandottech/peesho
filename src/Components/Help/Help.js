import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Mail, Phone } from 'lucide-react';
import Footone from '../Home/Footone/Footone';

const faqs = [
    {
        question: "Where is my order?",
        answer: "You can check the status of your order in the 'My Orders' section. We also send SMS and email updates at every step."
    },
    {
        question: "How do I return a product?",
        answer: "Go to 'My Orders', select the order you want to return, and click on 'Return'. Follow the instructions to schedule a pickup."
    },
    {
        question: "When will I get my refund?",
        answer: "Refunds are processed within 5-7 business days after the returned product is picked up and verified."
    },
    {
        question: "Can I cancel my order?",
        answer: "Yes, you can cancel your order from the 'My Orders' section before it is shipped."
    },
    {
        question: "Do you deliver to my pincode?",
        answer: "You can check deliverability by entering your pincode on the product details page."
    }
];

const Help = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-dm pb-20">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm border-b border-gray-100">
                <h1 className="text-lg font-bold text-gray-800">Help Center</h1>
            </div>

            {/* Search (Visual only) */}
            <div className="p-4 bg-white mb-2">
                <div className="flex items-center bg-gray-100 rounded-lg px-4 py-3">
                    <Search size={20} className="text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search for help..."
                        className="bg-transparent w-full outline-none text-sm text-gray-700 font-medium"
                    />
                </div>
            </div>

            {/* Contact Options */}
            <div className="bg-white p-4 mb-2 flex gap-4">
                <div className="flex-1 border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-colors">
                    <Mail size={24} className="text-[#9F2089]" />
                    <span className="text-xs font-bold text-gray-700">Email Us</span>
                </div>
                <div className="flex-1 border border-gray-200 rounded-lg p-3 flex flex-col items-center gap-2 cursor-pointer hover:bg-pink-50 hover:border-pink-200 transition-colors">
                    <Phone size={24} className="text-[#9F2089]" />
                    <span className="text-xs font-bold text-gray-700">Call Us</span>
                </div>
            </div>

            {/* FAQs */}
            <div className="bg-white">
                <h3 className="p-4 font-bold text-gray-800 border-b border-gray-100">Frequently Asked Questions</h3>
                <div>
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-100 last:border-0">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-700 text-[14px]">{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp size={18} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={18} className="text-gray-400" />
                                )}
                            </button>
                            {openIndex === index && (
                                <div className="px-4 pb-4 text-[13px] text-gray-500 leading-relaxed bg-gray-50 border-t border-gray-100">
                                    <div className="pt-3">{faq.answer}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Footone />
        </div>
    );
};

export default Help;
