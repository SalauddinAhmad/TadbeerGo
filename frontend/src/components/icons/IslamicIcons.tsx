import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

/**
 * Beautiful Mosque Icon with Dome, Twin Minarets, Arched Entrance, and Crescent Finial
 */
export const MosqueIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Crescent Finial on Main Dome */}
    <path d="M12 2a1.2 1.2 0 1 1-1.2 1.2" strokeWidth={1.5} />
    <path d="M12 3.2V5" />

    {/* Central Main Dome */}
    <path d="M7 11c0-4 2.2-6 5-6s5 2 5 6" />

    {/* Mosque Base and Walls */}
    <path d="M5 11h14v10H5z" />

    {/* Central Horseshoe/Pointed Arched Doorway */}
    <path d="M10 21v-5a2 2 0 0 1 4 0v5" />

    {/* Left Minaret */}
    <path d="M3 8h2v13H3z" />
    <path d="M4 4v4" />
    <path d="M3 4l1-1.5L5 4" />
    <circle cx="4" cy="2.2" r="0.5" fill="currentColor" />

    {/* Right Minaret */}
    <path d="M19 8h2v13h-2z" />
    <path d="M20 4v4" />
    <path d="M19 4l1-1.5 1 4" />
    <circle cx="20" cy="2.2" r="0.5" fill="currentColor" />

    {/* Arched windows on side walls */}
    <path d="M7.5 15v-1a0.5 0.5 0 0 1 1 0v1" strokeWidth={1.4} />
    <path d="M15.5 15v-1a0.5 0.5 0 0 1 1 0v1" strokeWidth={1.4} />

    {/* Base line */}
    <path d="M2 21h20" />
  </svg>
);

/**
 * Rich Filled & Detailed Mosque Icon for hero sections and prominent cards
 */
export const MosqueDetailedIcon: React.FC<IconProps> = ({
  size = 28,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
    {...props}
  >
    {/* Central Crescent */}
    <path d="M16 2.5a2 2 0 0 1-1.8 2.8 2 2 0 0 1-1.2-.4 2 2 0 1 0 3-2.4z" />
    <path d="M15.25 5h1.5v2h-1.5z" />

    {/* Grand Central Dome */}
    <path d="M16 7c-4.2 0-7.5 3.3-7.5 7.5v1.5h15v-1.5c0-4.2-3.3-7.5-7.5-7.5z" opacity="0.9" />

    {/* Main Building Body */}
    <path d="M7 16h18v12H7z" opacity="0.85" />

    {/* Grand Arched Gate (White Cutout / Transparent) */}
    <path
      d="M13 28v-7a3 3 0 0 1 6 0v7h-6z"
      fill="white"
      fillOpacity="0.25"
    />

    {/* Left Minaret */}
    <path d="M3.5 11h3v17h-3z" />
    <path d="M3 10.5h4V11H3z" />
    <path d="M5 4l2 5H3l2-5z" />
    <circle cx="5" cy="3" r="0.8" />

    {/* Right Minaret */}
    <path d="M25.5 11h3v17h-3z" />
    <path d="M25 10.5h4V11H25z" />
    <path d="M27 4l2 5h-4l2-5z" />
    <circle cx="27" cy="3" r="0.8" />

    {/* Side Arches */}
    <path d="M9.5 22v-3a1.5 1.5 0 0 1 3 0v3h-3z" fill="white" fillOpacity="0.2" />
    <path d="M19.5 22v-3a1.5 1.5 0 0 1 3 0v3h-3z" fill="white" fillOpacity="0.2" />

    {/* Ground Base */}
    <rect x="2" y="28" width="28" height="2" rx="1" />
  </svg>
);

/**
 * Holy Quran / Sacred Mushaf resting on a wooden Rehal stand
 */
export const QuranRehalIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Open Quran Pages */}
    <path d="M12 5c-2.5-2-6-2-9-1v10c3-1 6.5-1 9 1 2.5-2 6-2 9-1V4c-3-1-6.5-1-9 1z" />
    {/* Central Spine */}
    <path d="M12 5v10" />

    {/* Page detail text lines */}
    <path d="M5.5 7.5h3.5" strokeWidth={1.2} />
    <path d="M5.5 10.5h3.5" strokeWidth={1.2} />
    <path d="M15 7.5h3.5" strokeWidth={1.2} />
    <path d="M15 10.5h3.5" strokeWidth={1.2} />

    {/* Wooden Rehal Stand (Criss-Cross X Legs) */}
    <path d="M4 17l16 5" />
    <path d="M20 17L4 22" />
    <path d="M9 18.5l3-1.5 3 1.5" />
  </svg>
);

/**
 * Minbar (Pulpit for Friday Jumu'ah Khutbah and Lectures)
 */
export const MinbarIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Top Canopy / Dome of Minbar with Crescent */}
    <path d="M16 2.5a1 1 0 1 0-1 1" strokeWidth={1.3} />
    <path d="M15.5 3.5V5" />
    <path d="M12 7.5c0-1.5 1.5-2.5 3.5-2.5S19 6 19 7.5" />
    <path d="M12 7.5h7v2h-7z" />

    {/* Pulpit enclosure */}
    <path d="M13 9.5v8h6v-8" />
    <path d="M14.5 12.5a1.5 1.5 0 0 1 3 0v5h-3z" strokeWidth={1.3} />

    {/* Minbar Steps leading up */}
    <path d="M3 21h18" />
    <path d="M4 21v-3h3v-3h3v-3h3v6" />
    <path d="M7 18h3" />
    <path d="M10 15h3" />

    {/* Handrail on stairs */}
    <path d="M4 18L13 9.5" strokeDasharray="1 1" />
  </svg>
);

/**
 * Mihrab (Islamic Prayer Niche Arch with suspended Qandil Lamp)
 */
export const MihrabIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Outer Frame */}
    <rect x="3" y="2" width="18" height="20" rx="2" />

    {/* Mihrab Pointed Arch */}
    <path d="M6 22v-9.5C6 8 8 6 12 4c4 2 6 4 6 8.5V22" />

    {/* Inner decorative arch line */}
    <path d="M8 22v-8.5C8 10 9.5 8 12 6.5c2.5 1.5 4 3.5 4 7v8.5" strokeWidth={1.2} />

    {/* Hanging Lamp (Qandil) */}
    <path d="M12 6.5v4" strokeWidth={1.2} />
    <circle cx="12" cy="12" r="1.5" />
    <path d="M11 13.5l1 1.5 1-1.5" strokeWidth={1.2} />
  </svg>
);

/**
 * Holy Kaaba (Qibla Direction / Sacred Sanctuary)
 */
export const KaabaIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Kaaba Cube 3D Faces */}
    {/* Top Face */}
    <path d="M12 2l8 4-8 4-8-4 8-4z" />
    {/* Left Face */}
    <path d="M4 6v12l8 4V10L4 6z" />
    {/* Right Face */}
    <path d="M12 10v12l8-4V6l-8 4z" />

    {/* Kiswah Golden Band (Hizam) */}
    <path d="M4 9.5l8 4 8-4" strokeWidth={2} />
    <path d="M4 11.5l8 4 8-4" strokeWidth={1.2} />

    {/* Kaaba Golden Door (Bab al-Kaaba) on Right Face */}
    <path d="M14.5 14v4.5l3-1.5V12.5l-3 1.5z" strokeWidth={1.3} />
  </svg>
);

/**
 * Islamic Rub el Hizb (Traditional 8-pointed star ۞)
 */
export const RubElHizbIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* First square rotated */}
    <rect x="5" y="5" width="14" height="14" rx="1.5" />
    {/* Second square rotated 45 degrees */}
    <rect
      x="5"
      y="5"
      width="14"
      height="14"
      rx="1.5"
      transform="rotate(45 12 12)"
    />
    {/* Center circle */}
    <circle cx="12" cy="12" r="2.5" />
  </svg>
);

/**
 * Islamic Crescent Moon & Star (Hilal & Najm)
 */
export const CrescentStarIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Waxing Crescent Moon */}
    <path d="M14.5 3a9 9 0 1 0 6.5 15.2A9.5 9.5 0 0 1 14.5 3z" />
    {/* 5-pointed Islamic Star */}
    <polygon
      points="17,7 18.2,9.8 21.2,10.1 18.9,12.1 19.6,15.1 17,13.5 14.4,15.1 15.1,12.1 12.8,10.1 15.8,9.8"
      strokeWidth={1.2}
    />
  </svg>
);

/**
 * Tasbih / Islamic Prayer Beads
 */
export const TasbihIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Oval loop of beads */}
    <ellipse cx="12" cy="9" rx="8" ry="6" strokeDasharray="1.5 2.5" strokeWidth={2.4} />
    {/* Imamah (Top marker) */}
    <path d="M12 15v3" strokeWidth={2} />
    <circle cx="12" cy="15" r="1.5" />
    {/* Tassel */}
    <path d="M10.5 21l1.5-3 1.5 3" />
    <path d="M12 18v3.5" />
  </svg>
);

/**
 * Islamic Halqa / Dawah Programme gathering icon
 */
export const HalqaCircleIcon: React.FC<IconProps> = ({
  size = 24,
  className = '',
  strokeWidth = 1.8,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Central Scholar / Speaker with open book */}
    <circle cx="12" cy="8" r="2.5" />
    <path d="M9 13.5c0-1.8 1.3-3 3-3s3 1.2 3 3v0.5H9v-0.5z" />
    <path d="M10 16l2-1 2 1" strokeWidth={1.3} />

    {/* Circle of Attendees (Halqa) */}
    <circle cx="4.5" cy="12" r="1.5" />
    <circle cx="6.5" cy="18" r="1.5" />
    <circle cx="12" cy="20" r="1.5" />
    <circle cx="17.5" cy="18" r="1.5" />
    <circle cx="19.5" cy="12" r="1.5" />

    {/* Connecting aura */}
    <path d="M4 14.5c0 4.5 3.5 6.5 8 6.5s8-2 8-6.5" strokeDasharray="2 2" strokeWidth={1.2} />
  </svg>
);
