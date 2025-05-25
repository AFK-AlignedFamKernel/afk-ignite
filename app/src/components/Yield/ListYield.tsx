"use client";
import { FC, useState } from 'react';
import { useColorModeValue } from '@chakra-ui/react';

interface Vault {
  id: string;
  name: string;
  apy: number;
  imageUrl: string;
}

interface ListYieldProps {
  vaults?: Vault[];
  onVaultSelect?: (vault: Vault) => void;
}

type YieldProvider = 'vesu' | 'other';

const DEFAULT_VAULTS: Vault[] = [
  {
    id: '1',
    name: 'aBTC/BTC',
    apy: 10.2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYfZ4E98ZAFMpXS4ZJQwaSZnYhDP-7-zul36t7bQoX1rMLuYbPVcMlPRWFkCthnEsAdr5_P5jKicyuICDtRp39pc4wL9_WsaPQQXcmvc6cnqZSig0R8BOV18XWT9GMJ60aI5ku9Qzx0_lU7zl0CF82UxDRh8RlOKDMnis9m4sge3VxtKu6cRKMqb-4hZpQTDOYWYULT7w_rorP3Zolsl-VNVzPsIglhqYqsi6Xae_F1xecIyzXees9BVDbs2a7JqSTRpk-R4VbIRc'
  },
  {
    id: '2',
    name: 'aBTC/ETH',
    apy: 10.2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUvRRA9pIMCXv3rptsDHFamMKN1tg5UXf9MXBxI9n0iXW8lDgSDYKDGh03oHYaJWH65FmQ74JBkAuGPdv-azjWJxwPOgrABrviECcAA0I09X2VFWV0z57H-gV2zbN3tHPbWpGf91jEcSMt9QyITJGGSWW3Zn5B9MASGa0E1ysubRIj1pyROpw-GzN3zBOoKVmQGUWDlAIVbN_D8tU5i-Is-UPX4BfyAwcwXSxnr0lbDzasglzg67LIfHvYeCIAw1CrnV_VKuPllhc'
  },
  {
    id: '3',
    name: 'aBTC/USDT',
    apy: 10.2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA61y4sVycmNzOc3EXpjZMLW4JqCAspCqTsfQq0J7m8g8s64KPzFTX0gyvC8f_LNdBickCw8Y4y_R3VtS9_8uNnflOidatb2mJXhpizLNz2AcZ7kHC2jUNAPGJJdhUzOPsizgdtC3XiKEQIWbbaMAj5OGbC2c0VnEMOny2BDvjDaNuYPGufzyK9fn4-OQoYD5uR00dCEeY8i43w7CaeTkgAmEa_-I1udwTsP8mE-PQmFuY9BpiObT4gBbucHPH1AJvvRP3mFZ8caCk'
  }
];

const ListYield: FC<ListYieldProps> = ({ 
  vaults = DEFAULT_VAULTS,
  onVaultSelect 
}) => {
  const [activeProvider, setActiveProvider] = useState<YieldProvider>('vesu');
  const bgColor = useColorModeValue('var(--contrast-100)', 'var(--contrast-900)');
  const textColor = useColorModeValue('var(--contrast-900)', 'var(--contrast-100)');
  const secondaryTextColor = useColorModeValue('var(--contrast-500)', 'var(--contrast-400)');
  const borderColor = useColorModeValue('var(--border)', 'var(--contrast-700)');
  const bottomBarBg = useColorModeValue('var(--contrast-50)', 'var(--contrast-800)');
  const bottomBarBorder = useColorModeValue('var(--border)', 'var(--contrast-700)');
  const activeTabColor = useColorModeValue('var(--primary)', 'var(--primary)');
  const inactiveTabColor = useColorModeValue('var(--contrast-500)', 'var(--contrast-400)');

  return (
    <div
      className="relative flex size-full min-h-screen flex-col justify-between group/design-root overflow-x-hidden"
      style={{ 
        fontFamily: 'Inter, "Noto Sans", sans-serif',
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      <div>
        <div className="flex items-center p-4 pb-2 justify-between" style={{ backgroundColor: bgColor }}>
          <button className="flex size-12 shrink-0 items-center text-current">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Yield</h2>
        </div>

        <div className="pb-3">
          <div className="flex border-b px-4 gap-8" style={{ borderColor }}>
            <button 
              className="flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors duration-200"
              style={{ 
                borderColor: activeProvider === 'vesu' ? activeTabColor : 'transparent',
                color: activeProvider === 'vesu' ? activeTabColor : inactiveTabColor
              }}
              onClick={() => setActiveProvider('vesu')}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Vesu</p>
            </button>
            <button 
              className="flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors duration-200"
              style={{ 
                borderColor: activeProvider === 'other' ? activeTabColor : 'transparent',
                color: activeProvider === 'other' ? activeTabColor : inactiveTabColor
              }}
              onClick={() => setActiveProvider('other')}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Other</p>
            </button>
          </div>
        </div>

        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Vaults</h2>

        {activeProvider === 'vesu' ? (
          <div className="px-4 py-3">
            <p className="text-base text-center" style={{ color: secondaryTextColor }}>
              Vesu vaults coming soon...
            </p>
          </div>
        ) : (
          vaults.map((vault) => (
            <div 
              key={vault.id}
              className="flex items-center gap-4 px-4 min-h-[72px] py-2 cursor-pointer hover:bg-opacity-50 transition-colors duration-200"
              style={{ backgroundColor: bgColor }}
              onClick={() => onVaultSelect?.(vault)}
            >
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14"
                style={{ backgroundImage: `url(${vault.imageUrl})` }}
              />
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium leading-normal line-clamp-1">{vault.name}</p>
                <p className="text-sm font-normal leading-normal line-clamp-2" style={{ color: secondaryTextColor }}>
                  {vault.apy}% APY
                </p>
              </div>
            </div>
          ))
        )}
      </div>

  
    </div>
  );
};

export default ListYield;
