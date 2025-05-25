'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { useAccount } from '@starknet-react/core';
import { WalletConnectButton } from './account/WalletConnectButton';
import { Icon } from './small/icon-component';
import { useRouter } from 'next/navigation';
import CryptoLoading from './small/crypto-loading';
import Image from 'next/image';
import { useUIStore } from '@/store/uiStore';
import { AvatarIcon } from './small/icons';
import AccordionMenu from './small/AccordionMenu';
import { useColorModeValue } from '@chakra-ui/react';

const MobileBottomBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { showToast, showModal } = useUIStore()
  const [isLoading, setIsLoading] = useState(false);
  const router = typeof window === 'undefined' ? null : useRouter();

  const bgColor = useColorModeValue('white', '#111418');
  const textColor = useColorModeValue('gray.800', 'white');
  const secondaryTextColor = useColorModeValue('gray.600', '#9cabba');
  const borderColor = useColorModeValue('gray.200', '#3b4754');
  const bottomBarBg = useColorModeValue('gray.50', '#1b2127');
  const bottomBarBorder = useColorModeValue('gray.200', '#283039');
  const activeTabColor = useColorModeValue('blue.600', 'blue.400');
  const inactiveTabColor = useColorModeValue('gray.600', '#9cabba');

  const { address } = useAccount();
  useEffect(() => {
    if (address) {
      console.log('address', address);
    }
  }, [address]);



  // Close sidebar when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Now safe to use localStorage or document
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
      setDarkMode(false);
      document.body.classList.remove('dark-mode');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      if (prefersDark) {
        document.body.classList.add('dark-mode');
      }
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }

  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true);
      document.body.classList.add('page-transition');
    };

    const handleComplete = () => {
      setIsLoading(false);
      document.body.classList.remove('page-transition');
    };

    // router?.events?.on('routeChangeStart', handleStart);
    // router?.events?.on('routeChangeComplete', handleComplete);
    // router?.events?.on('routeChangeError', handleComplete);

    // return () => {
    //   router?.events?.off('routeChangeStart', handleStart);
    //   router?.events?.off('routeChangeComplete', handleComplete);
    //   router?.events?.off('routeChangeError', handleComplete);
    // };
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Then use mounted state to guard browser API access
  useEffect(() => {
    if (!mounted) return;
    // Safe to use browser APIs here
  }, [mounted]);

  return (
    <div

      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ backgroundColor: bottomBarBg }}
    >

      <div>
        <div className="flex gap-2 border-t px-4 pb-3 pt-2" style={{ backgroundColor: bottomBarBg, borderColor: bottomBarBorder }}>
          <button className="flex flex-1 flex-col items-center justify-end gap-1" style={{ color: secondaryTextColor }}>
            <div className="flex h-8 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path>
              </svg>
            </div>
            <Link href="/">
              <p className="text-xs font-medium leading-normal tracking-[0.015em]">Home</p>

            </Link>
          </button>

          <button className="flex flex-1 flex-col items-center justify-end gap-1" style={{ color: secondaryTextColor }}>
            <div className="flex h-8 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z"></path>
              </svg>
            </div>
            <p className="text-xs font-medium leading-normal tracking-[0.015em]">Swap</p>
          </button>

          <button className="flex flex-1 flex-col items-center justify-end gap-1" style={{ color: secondaryTextColor }}>
            <div className="flex h-8 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M232,160H200V101.34a71.89,71.89,0,0,0,29,21.42,8,8,0,0,0,6-14.83A55.78,55.78,0,0,1,200,56a8,8,0,0,0-16,0A56,56,0,0,1,72,56a8,8,0,0,0-16,0,55.78,55.78,0,0,1-35,51.93,8,8,0,0,0,6,14.83,71.89,71.89,0,0,0,29-21.42V160H24a8,8,0,0,0,0,16H56v24a8,8,0,0,0,16,0V176H184v24a8,8,0,0,0,16,0V176h32a8,8,0,0,0,0-16Zm-88-33.8V160H112V126.2a72,72,0,0,0,32,0Zm-72-25a72.47,72.47,0,0,0,24,19.27V160H72ZM160,160V120.48a72.47,72.47,0,0,0,24-19.27V160Z"></path>
              </svg>
            </div>
            <Link href="/bridge">
              <p className="text-xs font-medium leading-normal tracking-[0.015em]">Bridge</p>

            </Link>
          </button>

          <button className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full">
            <div className="flex h-8 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM200,176a8,8,0,0,1,0,16H56a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v62.92l34.88-29.07a8,8,0,0,1,9.56-.51l43,28.69,43.41-36.18a8,8,0,0,1,10.24,12.3l-48,40a8,8,0,0,1-9.56.51l-43-28.69L64,155.75V176Z"></path>
              </svg>
            </div>
            <Link href="/yield">
              <p className="text-xs font-medium leading-normal tracking-[0.015em]">Yield</p>
            </Link>
          </button>

          <button className="flex flex-1 flex-col items-center justify-end gap-1" style={{ color: secondaryTextColor }}>
            <div className="flex h-8 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z"></path>
              </svg>
            </div>
            <Link href="/history">
              <p className="text-xs font-medium leading-normal tracking-[0.015em]">History</p>

            </Link>
          </button>
        </div>
        <div className="h-5"
        // style={{ backgroundColor: bottomBarBg }}
        ></div>
      </div>


    </div>
  );
};

export default MobileBottomBar; 