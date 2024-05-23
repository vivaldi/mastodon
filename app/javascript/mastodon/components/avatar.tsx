import classNames from 'classnames';

import { useHovering } from '../../hooks/useHovering';
import type { Account } from '../../types/resources';
import { autoPlayGif } from '../initial_state';

interface Props {
  account: Account | undefined; // FIXME: remove `undefined` once we know for sure its always there
  size: number;
  style?: React.CSSProperties;
  inline?: boolean;
  animate?: boolean;
}

export const Avatar: React.FC<Props> = ({
  account,
  animate = autoPlayGif,
  size = 20,
  inline = false,
  style: styleFromParent,
}) => {
  const { hovering, handleMouseEnter, handleMouseLeave } = useHovering(animate);
  const handleBadgeClick = function(e) { window.open('https://login.vivaldi.net/profile/donations', '_blank', 'noopener'); e.preventDefault(); e.stopPropagation(); }

  const style = {
    ...styleFromParent,
    width: `${size}px`,
    height: `${size}px`,
  };

  const src =
    hovering || animate
      ? account?.get('avatar')
      : account?.get('avatar_static');

  let supporterBadge = false, patronBadge = false, advocateBadge = false, roleName = null;
  if (account?.get('roles')) {
    account?.get('roles').map((role) => {
      if (role.get('name') == 'Vivaldi Supporter') {
        supporterBadge = true;
        roleName = 'Vivaldi Supporter';
      } else if (role.get('name') == 'Vivaldi Patron') {
        patronBadge = true;
        roleName = 'Vivaldi Patron';
      } else if (role.get('name') == 'Vivaldi Advocate') {
        advocateBadge = true;
        roleName = 'Vivaldi Advocate';
      }
    });
  }
  if (roleName === null) {
    return (
      <div className='avatarwrap'>
        <div
          className={classNames('account__avatar', {
            'account__avatar-inline': inline,
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={style}
        >
          {src && <img src={src} alt={account?.get('acct')} />}
        </div>
      </div>
    );
  } else {
    return (
      <div className='avatarwrap'>
        <div
          className={classNames('account__avatar', {
            'account__avatar-inline': inline,
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={style}
        >
          {src && <img src={src} alt={account?.get('acct')} />}
        </div>
        <div
          className={classNames('badge', {
            'badge-level1': supporterBadge,
            'badge-level2': patronBadge,
            'badge-level3': advocateBadge,
          })}
          onClick={handleBadgeClick}
          title={roleName}
        >
        </div>
      </div>
    );
  }
};
