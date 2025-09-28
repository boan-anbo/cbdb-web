import { AsyncComboboxOption } from '@/render/components/ui/async-combobox';

export const DYNASTY_OPTIONS: AsyncComboboxOption[] = [
  { value: 'all', label: 'All dynasties' },
  { value: '0', label: '未詳 (Unknown)' },
  { value: '1', label: '漢前 (Pre-Han)' },
  { value: '2', label: '秦漢 (QinHan)' },
  { value: '3', label: '三國 (SanGuo)' },
  { value: '4', label: '南北朝 (NanBei Chao)' },
  { value: '5', label: '隋 (Sui)' },
  { value: '6', label: '唐 (Tang)' },
  { value: '7', label: '五代 (Five Dynasties)' },
  { value: '8', label: '後蜀 (Later Shu)' },
  { value: '9', label: '吳 (Wu)' },
  { value: '10', label: '南唐 (Southern Tang)' },
  { value: '11', label: '吳越 (WuYue)' },
  { value: '12', label: '閩國 (Min)' },
  { value: '13', label: '南漢 (Southern Han)' },
  { value: '14', label: '高麗 (Koryo)' },
  { value: '15', label: '宋 (Song)' },
  { value: '16', label: '遼 (Liao)' },
  { value: '17', label: '金 (Jin)' },
  { value: '18', label: '元 (Yuan)' },
  { value: '19', label: '明 (Ming)' },
  { value: '20', label: '清 (Qing)' },
  { value: '21', label: '中華民國 (Republic of China)' },
  { value: '22', label: '中華人民共和國 (People\'s Republic)' },
  { value: '23', label: '西晉 (Western Jin)' },
  { value: '24', label: '陳 (Chen)' },
  { value: '25', label: '東漢 (Eastern Han)' },
  { value: '26', label: '三國魏 (SanGuo Wei)' },
  { value: '27', label: '東晉 (Eastern Jin)' },
  { value: '28', label: '宋(劉) (Song Liu)' },
  { value: '29', label: '西漢 (Western Han)' },
  { value: '30', label: '北魏 (Northern Wei)' },
  { value: '31', label: '北周 (Northern Zhou)' },
  { value: '32', label: '南齊 (Southern Qi)' },
  { value: '34', label: '後梁 (Later Liang)' },
  { value: '35', label: '北齊 (Northern Qi)' },
  { value: '36', label: '吳(楊) (Wu Yang)' },
  { value: '37', label: '西梁 (Western Liang)' },
  { value: '38', label: '楚(馬) (Chu Ma)' },
  { value: '39', label: '前燕 (Former Yan)' },
  { value: '40', label: '西魏 (Western Wei)' },
  { value: '41', label: '東魏 (Eastern Wei)' },
  { value: '42', label: '三國吳 (SanGuo Wu)' },
  { value: '44', label: '南梁 (Southern Liang)' },
  { value: '45', label: '後秦 (Later Qin)' },
  { value: '46', label: '新 (Xin)' },
  { value: '47', label: '後唐 (Later Tang)' },
  { value: '48', label: '後晉 (Later Jin)' },
  { value: '49', label: '後周 (Later Zhou)' },
  { value: '50', label: '南燕 (Southern Yan)' },
  { value: '51', label: '前涼 (Former Liang)' },
  { value: '52', label: '後漢 (Later Han)' },
  { value: '53', label: '三國蜀 (SanGuo Shu)' },
  { value: '55', label: '南平 (Nanping)' },
  { value: '56', label: '西涼 (Western Liang)' },
  { value: '57', label: '偽齊 (Qi)' },
  { value: '58', label: '韓國 (Korea)' },
  { value: '59', label: '西遼 (Qara-Khitay)' },
  { value: '60', label: '北燕 (Northern Yan)' },
  { value: '61', label: '贏秦 (Ying Qin)' },
  { value: '62', label: '北涼 (Northern Liang)' },
  { value: '63', label: '後燕 (Later Yan)' },
  { value: '64', label: '後趙 (Later Zhao)' },
  { value: '65', label: '前秦 (Former Qin)' },
  { value: '66', label: '北漢 (Northern Han)' },
  { value: '67', label: '新羅 (Xinluo)' },
  { value: '68', label: '東梁 (Eastern Liang)' },
  { value: '69', label: '前趙 (Former Zhao)' },
  { value: '70', label: '成漢 (Cheng Han)' },
  { value: '71', label: '夏 (Xia)' },
  { value: '72', label: '西秦 (Western Qin)' },
  { value: '73', label: '後涼 (Later Liang 16)' },
  { value: '74', label: '南涼 (Southern Liang 16)' },
  { value: '75', label: '前蜀 (Former Shu)' },
  { value: '76', label: '西燕 (Western Yan)' },
  { value: '77', label: '周 (Zhou)' },
  { value: '78', label: '西夏 (Western Xia)' },
  { value: '79', label: '北元 (Northern Yuan)' },
  { value: '80', label: '南明 (Southern Ming)' },
  { value: '81', label: '鄭（王世充） (Zheng)' },
  { value: '82', label: '晉 (Jin)' },
  { value: '83', label: '漢 (Han)' },
  { value: '84', label: '朝鮮 (Choson)' },
];

export const RESULTS_PER_PAGE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
];

export const GENDER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

// Helper functions
export const getDynastyName = (code: string): string => {
  const dynasty = DYNASTY_OPTIONS.find(d => d.value === code);
  return dynasty ? dynasty.label : `Dynasty ${code}`;
};

export const loadDynastyOptions = async (query: string): Promise<AsyncComboboxOption[]> => {
  if (!query) {
    return DYNASTY_OPTIONS;
  }

  const lowerQuery = query.toLowerCase();
  return DYNASTY_OPTIONS.filter(option =>
    option.label.toLowerCase().includes(lowerQuery) ||
    option.value.includes(query)
  );
};