export const useValidateMbti = () => {
  return (selectedMbti: string): boolean => {
    if (!selectedMbti) {
      alert('MBTI를 선택하세요.');
      return false;
    }
    return true;
  };
};
