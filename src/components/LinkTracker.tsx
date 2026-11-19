'use client';

import { useEffect } from 'react';
import { WHATSAPP_GROUP_URL } from '@/lib/links';
import { track } from '@/lib/track';

/** Clicks on the WhatsApp group (menu, guide, about and practice summary) → `join_group`, with the page as `location`. */
export function LinkTracker() {
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
            if (link instanceof HTMLAnchorElement && link.href === WHATSAPP_GROUP_URL) track('join_group', { group: 'fretquest', location: window.location.pathname });
        };
        document.addEventListener('click', onClick, { capture: true });
        return () => document.removeEventListener('click', onClick, { capture: true });
    }, []);
    return null;
}
