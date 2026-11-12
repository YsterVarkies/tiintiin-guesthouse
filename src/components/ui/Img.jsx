import { forwardRef } from 'react';
import { imageMeta, imageSrcSet, imageUrl } from '../../lib/images';

/**
 * Responsive WebP image from the generated manifest, with a blurred placeholder
 * painted behind it while it loads.
 */
const Img = forwardRef(function Img(
  { name, alt = '', sizes = '100vw', className = '', eager = false, style, want = 1280, ...rest },
  ref
) {
  const meta = imageMeta(name);
  if (!meta) return null;
  return (
    <img
      ref={ref}
      className={className}
      src={imageUrl(name, want)}
      srcSet={imageSrcSet(name)}
      sizes={sizes}
      width={meta.w}
      height={meta.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      draggable="false"
      style={{ backgroundImage: `url(${meta.blur})`, backgroundSize: 'cover', ...style }}
      {...rest}
    />
  );
});

export default Img;
