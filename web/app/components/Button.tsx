import Link, { LinkProps } from 'next/link';
import clsx from 'clsx';
import { HTMLAttributeAnchorTarget, PropsWithChildren } from 'react';

interface ButtonProps {
  invert?: boolean;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  className?: string;
}

export function Button({
  invert,
  href,
  className,
  children,
  ...props
}: PropsWithChildren<ButtonProps>) {
  className = clsx(
    className,
    'flex gap-2 items-center justify-center rounded-lg px-4 pt-1 pb-1.5 font-semibold focus:outline-none text-base border-2 active:bg-button-active hover:bg-button-hover disabled:bg-opacity-50',
    invert
      ? 'text-dark-green-600 bg-white border-dark-green-600'
      : 'text-white bg-dark-green-600 border-transparent'
  );

  let inner = <span className="relative w-full text-center top-px">{children}</span>;

  if (href) {
    return (
      <Link href={href} target={props.target} className={className} {...props}>
        {inner}
      </Link>
    );
  }

  return (
    <button className={className} {...props}>
      {inner}
    </button>
  );
}
