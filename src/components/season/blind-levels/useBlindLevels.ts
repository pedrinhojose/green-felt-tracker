
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { BlindLevel } from "@/lib/db/models";

export function useBlindLevels(
  initialBlindLevels: BlindLevel[],
  onChange: (blindLevels: BlindLevel[]) => void
) {
  const [isBreakDialogOpen, setIsBreakDialogOpen] = useState(false);
  
  const addLevel = () => {
    const newLevel: BlindLevel = {
      id: uuidv4(),
      level: initialBlindLevels.length + 1,
      smallBlind: initialBlindLevels.length > 0 ? initialBlindLevels[initialBlindLevels.length - 1].smallBlind * 2 : 25,
      bigBlind: initialBlindLevels.length > 0 ? initialBlindLevels[initialBlindLevels.length - 1].bigBlind * 2 : 50,
      ante: initialBlindLevels.length > 0 ? initialBlindLevels[initialBlindLevels.length - 1].ante : 0,
      duration: 20,
      isBreak: false,
    };
    
    console.log("Adding new blind level:", newLevel);
    
    const updatedLevels = [...initialBlindLevels, newLevel];
    onChange(updatedLevels);
  };

  const addBreak = (selectedLevelIndex: number, breakDuration: number) => {
    if (isNaN(selectedLevelIndex)) {
      console.error("Invalid level index for break");
      return;
    }
    
    // Create the new break
    const newBreak: BlindLevel = {
      id: uuidv4(),
      level: selectedLevelIndex + 1,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: breakDuration,
      isBreak: true,
    };
    
    // Get the levels before and after the selected index
    const levelsBeforeBreak = initialBlindLevels.slice(0, selectedLevelIndex);
    const levelsAfterBreak = initialBlindLevels.slice(selectedLevelIndex);
    
    // Insert the break and update subsequent level numbers
    const updatedLevelsAfterBreak = levelsAfterBreak.map(level => ({
      ...level,
      level: level.level + 1
    }));
    
    // Combine all levels with the break inserted
    const updatedLevels = [
      ...levelsBeforeBreak,
      newBreak,
      ...updatedLevelsAfterBreak
    ];
    
    onChange(updatedLevels);
  };

  const updateLevel = (index: number, field: keyof BlindLevel, value: any) => {
    if (index < 0 || index >= initialBlindLevels.length) {
      console.error("Invalid index for updating blind level:", index);
      return;
    }
    
    const updatedLevels = [...initialBlindLevels];
    updatedLevels[index] = { ...updatedLevels[index], [field]: value };
    onChange(updatedLevels);
  };

  const removeLevel = (index: number) => {
    const updatedLevels = initialBlindLevels.filter((_, i) => i !== index);
    // Update level numbers after removal
    const reorderedLevels = updatedLevels.map((level, idx) => ({
      ...level,
      level: idx + 1
    }));
    onChange(reorderedLevels);
  };

  return {
    isBreakDialogOpen,
    setIsBreakDialogOpen,
    addLevel,
    addBreak,
    updateLevel,
    removeLevel
  };
}
