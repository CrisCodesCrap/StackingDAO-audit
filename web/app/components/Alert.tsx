import React, { ReactNode } from 'react';
import { classNames } from '../common/class-names';
import { StyledIcon } from './StyledIcon';

enum AlertType {
  WARNING,
  ERROR,
  SUCCESS,
  INFO,
}

type AlertTypeConfig = {
  wrapperClass: string;
  icon: ReactNode;
  titleClass: string;
  contentClass: string;
};

type Props = {
  type?: AlertType;
  children: ReactNode;
  title?: string;
  icon?: boolean;
};

const configMap: Record<AlertType, AlertTypeConfig> = {
  [AlertType.WARNING]: {
    wrapperClass: 'border-yellow-700/25 bg-yellow-50',
    icon: <StyledIcon as="ExclamationIcon" size={5} className="text-yellow-400" />,
    titleClass: 'text-yellow-800',
    contentClass: 'text-yellow-700',
  },
  [AlertType.ERROR]: {
    wrapperClass: 'border-red-700/25 bg-red-50',
    icon: <StyledIcon as="XCircleIcon" size={5} className="text-red-400" />,
    titleClass: 'text-red-800',
    contentClass: 'text-red-700',
  },
  [AlertType.SUCCESS]: {
    wrapperClass: 'border-green-700/25 bg-green-50',
    icon: <StyledIcon as="CheckCircleIcon" size={5} className="text-green-400" />,
    titleClass: 'text-green-800',
    contentClass: 'text-green-700',
  },
  [AlertType.INFO]: {
    wrapperClass: 'border-blue-700/25 bg-blue-50',
    icon: <StyledIcon as="InformationCircleIcon" size={5} className="text-blue-400" />,
    titleClass: 'text-blue-800',
    contentClass: 'text-blue-700',
  },
};

export function Alert({ children, type = AlertType.INFO, title, icon = false }: Props) {
  const alert = configMap[type];

  return (
    <div className={classNames('p-4 border-2 rounded-lg', alert.wrapperClass)} role="alert">
      <div className="flex">
        {icon ? <div className="shrink-0">{alert.icon}</div> : null}
        <div className={`flex-1 ${icon ? 'ml-3' : ''}`}>
          {title ? (
            <h3 className={classNames('text-sm font-semibold', alert.titleClass)}>{title}</h3>
          ) : null}
          <div className={classNames(`${title ? 'mt-2' : ''} text-sm`, alert.contentClass)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

Alert.type = AlertType;
