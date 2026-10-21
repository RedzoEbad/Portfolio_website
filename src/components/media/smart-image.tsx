import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

const OPTIMIZED = (process.env.NEXT_PUBLIC_OPTIMIZED_IMAGE_HOSTS ?? "res.cloudinary.com").split(",").filter(Boolean);

function isOptimizable(src: string) {
  try {
    return OPTIMIZED.includes(new URL(src).hostname);
  } catch {
    return src.startsWith("/");
  }
}

/**
 * next/image for allowed hosts (Cloudinary + IMAGE_REMOTE_HOSTS); a lazy plain <img>
 * for any other URL an admin pastes, so a new host never breaks a page.
 */
export function SmartImage({ src, alt, className, fill, sizes, priority, width, height, ...rest }: Omit<ImageProps, "src"> & { src: string }) {
  if (isOptimizable(src)) {
    return fill ? (
      <Image src={src} alt={alt} fill sizes={sizes ?? "100vw"} priority={priority} className={className} {...rest} />
    ) : (
      <Image src={src} alt={alt} width={Number(width) || 1600} height={Number(height) || 900} sizes={sizes} priority={priority} className={className} {...rest} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={width ? Number(width) : undefined}
      height={height ? Number(height) : undefined}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
    />
  );
}
