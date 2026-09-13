import { Text, View } from '@react-pdf/renderer';
import type { ComponentProps } from 'react';

export type PdfStyle = ComponentProps<typeof View>['style'];

/** Base palette for every template, matching the site's light theme. */
export const ink = {
  text: '#171717',
  body: '#262626',
  muted: '#525252',
  subtle: '#737373',
  rule: '#d4d4d4',
  wash: '#f5f5f4',
  brand: '#047857',
};

interface BulletsProps {
  items: string[];
  row: PdfStyle;
  mark: PdfStyle;
  text: PdfStyle;
}

export function Bullets({ items, row, mark, text }: BulletsProps) {
  return (
    <>
      {items.map((item) => (
        <View key={item} style={row}>
          <Text style={mark}>•</Text>
          <Text style={text}>{item}</Text>
        </View>
      ))}
    </>
  );
}

export const mailto = (email: string) => `mailto:${email}`;
