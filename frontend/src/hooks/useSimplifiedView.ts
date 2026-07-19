/**
 * @fileoverview useSimplifiedView hook — persists simplified/accessible view preference.
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'sp_simplified_view';

export function useSimplifiedView() {
  const [simplified, setSimplified] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(simplified));
    if (simplified) {
      document.documentElement.classList.add('simplified');
      document.documentElement.setAttribute('data-simplified', 'true');
    } else {
      document.documentElement.classList.remove('simplified');
      document.documentElement.removeAttribute('data-simplified');
    }
  }, [simplified]);

  const toggle = () => setSimplified((prev) => !prev);

  return { simplified, toggle };
}
