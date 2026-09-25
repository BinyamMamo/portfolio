/**
 * Small icons for the vibrant template's contact badges. Brand marks (GitHub, LinkedIn) reuse the
 * real path data already sourced from svgl at public/icons/, rather than a hand-drawn approximation.
 * Phone, mail and location are generic glyphs, not brand marks, so a simple monoline icon is fine.
 */
import { Circle, Path, Svg } from '@react-pdf/renderer';

interface IconProps {
  size?: number;
  color?: string;
}

export function PhoneIcon({ size = 10, color = '#171717' }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.3 1L6.6 10.8Z"
        fill={color}
      />
    </Svg>
  );
}

export function MailIcon({ size = 10, color = '#171717' }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.6 2 6.7 5.4a1 1 0 0 0 1.4 0L19.4 7H4.6ZM4 8.8V17h16V8.8l-6.6 5.3a2 2 0 0 1-2.8 0L4 8.8Z"
        fill={color}
      />
    </Svg>
  );
}

export function PinIcon({ size = 10, color = '#171717' }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M12 22s7-7.4 7-12.5C19 5.4 15.9 2 12 2S5 5.4 5 9.5C5 14.6 12 22 12 22Zm0-9.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
        fill={color}
      />
    </Svg>
  );
}

export function LinkIcon({ size = 10, color = '#171717' }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d="M9.5 14.5 14.5 9.5M8 17H6a5 5 0 0 1 0-10h2m8 0h2a5 5 0 0 1 0 10h-2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function GitHubIcon({ size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size}>
      <Path
        fill="#1b1f23"
        fillRule="evenodd"
        d="M512 0C229.12 0 0 229.12 0 512c0 226.56 146.56 417.92 350.08 485.76 25.6 4.48 35.2-10.88 35.2-24.32 0-12.16-.64-52.48-.64-95.36-128.64 23.68-161.92-31.36-172.16-60.16-5.76-14.72-30.72-60.16-52.48-72.32-17.92-9.6-43.52-33.28-.64-33.92 40.32-.64 69.12 37.12 78.72 52.48 46.08 77.44 119.68 55.68 149.12 42.24 4.48-33.28 17.92-55.68 32.64-68.48-113.92-12.8-232.96-56.96-232.96-252.8 0-55.68 19.84-101.76 52.48-137.6-5.12-12.8-23.04-65.28 5.12-135.68 0 0 42.67-13.44 139.84 52.48 40.96-11.52 84.48-17.28 128-17.28 43.52 0 87.04 5.76 128 17.28C750.08 106.24 792.75 119.68 792.75 119.68c28.16 70.4 10.24 122.88 5.12 135.68 32.64 35.84 52.48 81.28 52.48 137.6 0 195.84-119.68 239.36-233.6 252.8 18.56 16 34.56 46.72 34.56 94.72 0 68.48-.64 123.52-.64 140.8 0 13.44 9.6 29.44 35.2 24.32C877.44 929.92 1024 738.56 1024 512 1024 229.12 794.88 0 512 0Z"
      />
    </Svg>
  );
}

export function LinkedInIcon({ size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 256 256" width={size} height={size}>
      <Path
        fill="#0A66C2"
        d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
      />
    </Svg>
  );
}

export function WhatsAppIcon({ size = 10 }: IconProps) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        fill="#25D366"
        d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.5-.3Z"
      />
      <Path
        fill="#25D366"
        d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 4.9L2 22l5.3-1.4C8.6 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.2.8.9-3.1-.2-.3C4 14.7 3.6 13.4 3.6 12c0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4-3.8 8.4-8.4 8.4Z"
      />
    </Svg>
  );
}

/** Picks the icon for a link by its label, falling back to a generic link glyph. */
export function iconForLink(label: string, size = 10) {
  switch (label.toLowerCase()) {
    case 'github':
      return <GitHubIcon size={size} />;
    case 'linkedin':
      return <LinkedInIcon size={size} />;
    case 'whatsapp':
      return <WhatsAppIcon size={size} />;
    default:
      return <LinkIcon size={size} color="#404040" />;
  }
}

/** A small ring used as a timeline marker in front of an entry's title. */
export function Dot({ size = 6, color = '#047857' }: IconProps) {
  return (
    <Svg viewBox="0 0 10 10" width={size} height={size}>
      <Circle cx={5} cy={5} r={4} fill={color} />
    </Svg>
  );
}
