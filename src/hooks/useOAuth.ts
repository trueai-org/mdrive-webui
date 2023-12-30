// useOAuth.ts
import { useState, useCallback } from 'react';

export const useOAuth = () => {
    const [isVisible, setIsVisible] = useState(false);

    const show = useCallback(() => {
        setIsVisible(true);
    }, []);

    const hide = useCallback(() => {
        setIsVisible(false);
    }, []);

    return {
        isVisible,
        show,
        hide,
    };
};
