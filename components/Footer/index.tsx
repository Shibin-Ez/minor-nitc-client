import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface FooterProps {
    handleNext: () => void;
    loading: boolean;
}

export default function Footer(
    {
        handleNext,
        loading
    }: FooterProps
) {
    return(
        <footer className="bg-[#171A23] text-white justify-end flex text-center py-4 fixed bottom-0 w-full">
            <button className="bg-[#4E9396] w-16 justify-center flex items-center px-12 py-2 rounded-md mx-10" onClick={handleNext}>
                {
                    loading ? <LoadingSpinner /> : 'Next'
                }
            </button>
        </footer>
    )
}