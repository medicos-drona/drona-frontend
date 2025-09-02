declare module 'react-katex' {
  import { ComponentType } from 'react';

  interface KaTeXProps {
    children?: string;
    math?: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: any;
  }

  export const InlineMath: ComponentType<KaTeXProps>;
  export const BlockMath: ComponentType<KaTeXProps>;
}
