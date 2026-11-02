import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import type { LayoutChangeEvent, View } from "react-native";

export function useMeasuredWidth() {
  const ref = useRef<View>(null);
  const [width, setWidth] = useState(0);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    if (next > 0) setWidth(next);
  }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const element = ref.current as unknown as HTMLElement | null;
    if (!element?.getBoundingClientRect) return;
    const measure = () => {
      const next = element.getBoundingClientRect().width;
      if (next > 0) setWidth(next);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener("resize", measure);
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  return { ref, onLayout, width };
}
