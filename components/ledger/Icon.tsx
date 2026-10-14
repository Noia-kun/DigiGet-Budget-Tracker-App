import type { ReactNode } from "react";
import type { ColorValue } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

type Props = { name: string; size?: number; color?: ColorValue };

/** Inline vector icons avoid runtime webfont loading in the Expo Preview. */
export function Icon({ name, size = 20, color = "#17231C" }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };
  const path = (d: string) => <Path d={d} {...stroke} />;
  const line = (x1: number, y1: number, x2: number, y2: number) => (
    <Line x1={x1} y1={y1} x2={x2} y2={y2} {...stroke} />
  );
  let drawing: ReactNode;

  switch (name) {
    case "add":
    case "add-circle-outline":
      drawing = (
        <>
          {name === "add-circle-outline" && (
            <Circle cx="12" cy="12" r="9" {...stroke} />
          )}
          {line(12, 7, 12, 17)}
          {line(7, 12, 17, 12)}
        </>
      );
      break;
    case "close":
      drawing = (
        <>
          {line(6, 6, 18, 18)}
          {line(18, 6, 6, 18)}
        </>
      );
      break;
    case "checkmark":
      drawing = path("m5 12 4.5 4.5L19 7");
      break;
    case "checkmark-circle":
      drawing = (
        <>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          {path("m7 12 3.3 3.3L17.5 8")}
        </>
      );
      break;
    case "chevron-down":
      drawing = path("m6 9 6 6 6-6");
      break;
    case "chevron-back":
      drawing = path("m15 18-6-6 6-6");
      break;
    case "chevron-forward":
    case "arrow-forward":
      drawing =
        name === "arrow-forward"
          ? path("M5 12h13m-5-5 5 5-5 5")
          : path("m9 18 6-6-6-6");
      break;
    case "grid-outline":
      drawing = (
        <>
          <Rect x="3.5" y="3.5" width="7" height="7" rx="1.5" {...stroke} />
          <Rect x="13.5" y="3.5" width="7" height="7" rx="1.5" {...stroke} />
          <Rect x="3.5" y="13.5" width="7" height="7" rx="1.5" {...stroke} />
          <Rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...stroke} />
        </>
      );
      break;
    case "receipt-outline":
      drawing = (
        <>
          {path("M6 3.5h12v17l-3-1.8-3 1.8-3-1.8-3 1.8z")}
          {line(9, 8, 15, 8)}
          {line(9, 12, 15, 12)}
          {line(9, 16, 12.5, 16)}
        </>
      );
      break;
    case "pie-chart-outline":
      drawing = (
        <>
          {path("M11 3.2a9 9 0 1 0 9.8 9.8H11z")}
          {path("M14 3.5v6.5h6.5A9 9 0 0 0 14 3.5z")}
        </>
      );
      break;
    case "settings-outline":
      drawing = (
        <>
          <Circle cx="12" cy="12" r="3" {...stroke} />
          {path(
            "M19.4 13.5a7.8 7.8 0 0 0 0-3l1.5-1.1-1.5-2.6-1.8.6a8 8 0 0 0-2.5-1.5L14.8 4h-3l-.3 1.9A8 8 0 0 0 9 7.4l-1.8-.6-1.5 2.6 1.5 1.1a7.8 7.8 0 0 0 0 3l-1.5 1.1 1.5 2.6 1.8-.6a8 8 0 0 0 2.5 1.5l.3 1.9h3l.3-1.9a8 8 0 0 0 2.5-1.5l1.8.6 1.5-2.6z",
          )}
        </>
      );
      break;
    case "person-outline":
      drawing = (
        <>
          <Circle cx="12" cy="8" r="3.5" {...stroke} />
          {path("M4.5 20a7.5 7.5 0 0 1 15 0z")}
        </>
      );
      break;
    case "book-outline":
      drawing = path(
        "M12 6.5C9.7 4.9 6.6 4.5 3 5.4v13.1c3.6-.9 6.7-.5 9 1.1m0-13.1c2.3-1.6 5.4-2 9-1.1v13.1c-3.6-.9-6.7-.5-9 1.1m0-13.1v13.1",
      );
      break;
    case "leaf":
    case "leaf-outline":
      drawing = (
        <>
          {path(
            "M20.5 3.5C12 3.4 5.4 5.1 4 11.3c-1 4.4 3 7.4 7 6.7 6.4-1 9.1-7 9.5-14.5Z",
          )}
          {path("M4 21c2.5-4.6 6.3-8 11-10.5")}
        </>
      );
      break;
    case "restaurant-outline":
      drawing = (
        <>
          {path("M5 3v7a3.5 3.5 0 0 0 7 0V3M8.5 3v18M18 3c-3 4-3 8 0 9v9")}
          {line(5, 7, 12, 7)}
        </>
      );
      break;
    case "home-outline":
      drawing = path("m3 10 9-7 9 7M5.5 9v11h13V9M9.5 20v-6h5v6");
      break;
    case "train-outline":
      drawing = (
        <>
          {path(
            "M7 3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z",
          )}
          {line(4, 13, 20, 13)}
          <Circle cx="8" cy="16" r="1" fill={color} />
          <Circle cx="16" cy="16" r="1" fill={color} />
          {line(8, 21, 6, 19)}
          {line(16, 21, 18, 19)}
        </>
      );
      break;
    case "bag-outline":
      drawing = (
        <>
          {path("M5 8h14l1 12H4L5 8Z")}
          {path("M9 9V6a3 3 0 0 1 6 0v3")}
        </>
      );
      break;
    case "heart-outline":
      drawing = path(
        "M20.5 8.8c0 5-8.5 11-8.5 11s-8.5-6-8.5-11a4.5 4.5 0 0 1 8.5-1.9 4.5 4.5 0 0 1 8.5 1.9Z",
      );
      break;
    case "ellipsis-horizontal-circle-outline":
      drawing = (
        <>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Circle cx="7.5" cy="12" r="0.7" fill={color} />
          <Circle cx="12" cy="12" r="0.7" fill={color} />
          <Circle cx="16.5" cy="12" r="0.7" fill={color} />
        </>
      );
      break;
    case "briefcase-outline":
      drawing = (
        <>
          {path("M4 8h16v12H4zM9 8V5h6v3")}
          {line(4, 13, 20, 13)}
          {line(10, 12, 14, 12)}
        </>
      );
      break;
    case "laptop-outline":
      drawing = (
        <>
          {path("M5 5h14v11H5z")}
          {path("M3 19h18l-1.5-3h-15z")}
        </>
      );
      break;
    case "pricetag-outline":
      drawing = (
        <>
          {path("M20 13 13 20 3.5 10.5V4h6.5L20 13Z")}
          <Circle cx="7.5" cy="7.5" r="1" fill={color} />
        </>
      );
      break;
    case "search-outline":
      drawing = (
        <>
          <Circle cx="10.8" cy="10.8" r="6.8" {...stroke} />
          {line(16, 16, 21, 21)}
        </>
      );
      break;
    case "options-outline":
      drawing = (
        <>
          {line(4, 6, 20, 6)}
          {line(4, 12, 20, 12)}
          {line(4, 18, 20, 18)}
          <Circle
            cx="9"
            cy="6"
            r="1.8"
            fill="#fff"
            stroke={color}
            strokeWidth="1.8"
          />
          <Circle
            cx="15"
            cy="12"
            r="1.8"
            fill="#fff"
            stroke={color}
            strokeWidth="1.8"
          />
          <Circle
            cx="8"
            cy="18"
            r="1.8"
            fill="#fff"
            stroke={color}
            strokeWidth="1.8"
          />
        </>
      );
      break;
    case "refresh-outline":
      drawing = path(
        "M20 7v5h-5M4 17v-5h5m-4-2a7.5 7.5 0 0 1 13-3l2 2M4 15l2 2a7.5 7.5 0 0 0 13-3",
      );
      break;
    case "cloud-offline-outline":
      drawing = (
        <>{path("M19 18H8a5 5 0 0 1-.7-9.9A6.5 6.5 0 0 1 19.5 10M3 3l18 18")}</>
      );
      break;
    case "cloud-upload-outline":
      drawing = (
        <>
          {path("M19 18H7a5 5 0 0 1-.5-10A6.5 6.5 0 0 1 19 10")}
          {path("m9 15 3-3 3 3M12 12v8")}
        </>
      );
      break;
    case "trash-outline":
      drawing = (
        <>
          {path("M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7")}
          {line(10, 11, 10, 17)}
          {line(14, 11, 14, 17)}
        </>
      );
      break;
    case "arrow-down-circle-outline":
    case "arrow-up-circle-outline": {
      const up = name === "arrow-up-circle-outline";
      drawing = (
        <>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          {path(up ? "M12 17V7m-4 4 4-4 4 4" : "M12 7v10m-4-4 4 4 4-4")}
        </>
      );
      break;
    }
    case "ellipse-outline":
    default:
      drawing = <Circle cx="12" cy="12" r="8" {...stroke} />;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {drawing}
    </Svg>
  );
}
