import clsx from 'clsx'

interface ContainerProps {
  as: any;
  className: string;
  children: any;
}

export function Container({ as: Component = 'div', className, children }: ContainerProps) {
  return (
    <Component className={clsx('mx-auto max-w-7xl px-6 lg:px-8', className)}>
      <div className="mx-auto max-w-2xl lg:max-w-none">{children}</div>
    </Component>
  )
}
