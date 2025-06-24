import React from 'react';

const IconBase: React.FC<{ iconName: string; className?: string; filled?: boolean }> = ({ iconName, className, filled }) => (
  <span className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className || 'text-base leading-none'}`}>
    {iconName}
  </span>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="add" className={className} />
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="edit" className={className} />
);

export const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="delete" className={className} />
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => ( // General purpose check, not for the checkbox itself
  <IconBase iconName="task_alt" className={className} />
);

export const RestoreIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="restore_from_trash" className={className} />
);

export const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="close" className={className} />
);

export const StarIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className, filled }) => (
  <IconBase iconName={filled ? 'star' : 'star_outline'} className={className} filled={filled && filled} /> // Pass filled to IconBase if logic is to use font-variation-settings
                                                                              // If using separate icon names, filled prop to IconBase is not strictly needed for the name itself.
                                                                              // For simplicity, Material Symbols often use 'star' for filled and 'star_outline' for outline.
                                                                              // The filled class can be used for font variation settings.
);


export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="search" className={className} />
);

export const ArrowUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="arrow_upward" className={className} />
);

export const ArrowDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="arrow_downward" className={className} />
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="light_mode" className={className} />
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconBase iconName="dark_mode" className={className} />
);