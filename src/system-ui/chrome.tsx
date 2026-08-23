// src/system-ui/chrome.tsx — presentational theme-neutral chrome, Vue Vapor JSX
// (vue-jsx-vapor; lists are plain .map() like every vapor JSX app in the
// repo). Every component here only paints; the compositor (app.tsx) owns hit
// testing and routes all pointer/keyboard input itself off the svc mouse
// stream, so nothing in this file registers a handler. Geometry mirrors
// wm.ts through the active theme's ChromeMetrics.
//
// Class strings are FULL literals throughout — the style table compiles at
// build time and template-interpolated fragments are a compile error, so the
// complete theme-selected classes stay visible to the compiler.

import { Image, Text, View } from "@pocketjs/framework/components";
import {
  type DesktopTheme,
  type StartMenuZone,
} from "./theme.ts";
import type {
  DeskIcon,
  Popup,
  PopupItem,
  TaskEntry,
  WinCtl,
} from "./state.ts";
import { desktopIconPosition } from "./wm.ts";

/** Theme-selected baked text. Classic uses W95FA slots 19/20/21; XP uses
 *  anti-aliased Inter-derived slots 22/23. The slots ride the style prop, so
 *  the class table does not need to know about app-local font families. */
export function UiText(props: {
  t: string;
  cls?: string;
  bold?: boolean;
  xl?: boolean;
  theme: DesktopTheme;
}) {
  return (
    <Text
      class={props.cls ?? "text-[#000000]"}
      style={{
        fontSlot: props.theme.fontSlot(
          props.bold ?? false,
          props.xl ?? false,
        ),
      }}
    >
      {props.t}
    </Text>
  );
}

/** Caption controls. wm.ts mirrors the theme-selected cell size, right inset
 *  and gap. app.tsx drives pressed feedback off the raw pointer stream. */
export function CaptionButtons(props: {
  win: WinCtl;
  active: boolean;
  theme: DesktopTheme;
}) {
  const w = props.win;
  return (
    <View class={props.theme.captionControls}>
      {w.buttons.map((btn) => (
        <View
          class={props.theme.captionButton(
            btn,
            w.pressedBtn.value === btn,
            props.active,
          )}
        >
          <Image
            class={props.theme.captionGlyphClass(
              w.pressedBtn.value === btn,
            )}
            src={props.theme.captionGlyphSource(
              btn,
              btn === "max" && w.maximized.value,
            )}
          />
        </View>
      ))}
    </View>
  );
}

/** The taskbar: the Start button (PocketJS favicon mark, gen-icons
 *  start-logo), one button per window, the sunken clock tray. */
export function Taskbar(props: {
  entries: TaskEntry[];
  activeId: number;
  startOpen: boolean;
  clock: string;
  buttonW: number;
  theme: DesktopTheme;
}) {
  return (
    <View
      class={props.theme.taskbar}
      style={{ zIndex: 10000 }}
    >
      <View
        class={props.theme.startButton(props.startOpen)}
      >
        <Image
          class="w-[18] h-[18]"
          src={props.theme.iconSource("icons/start-logo.svg")}
        />
        <UiText
          bold
          cls={props.theme.startText}
          t={props.theme.id === "xp" ? "start" : "Start"}
          theme={props.theme}
        />
      </View>
      <View class={props.theme.taskDivider} />
      <View class={props.theme.taskList}>
        {props.entries.map((entry) => (
          <View
            class={props.theme.taskButton(entry.id === props.activeId)}
            style={{ width: props.buttonW }}
          >
            <Image
              class="w-[16] h-[16]"
              src={props.theme.iconSource(entry.icon)}
            />
            <View class="flex-1 flex-row overflow-hidden">
              <UiText
                bold={entry.id === props.activeId}
                cls={props.theme.taskText(entry.id === props.activeId)}
                t={entry.title}
                theme={props.theme}
              />
            </View>
          </View>
        ))}
      </View>
      <View class={props.theme.tray}>
        <UiText cls={props.theme.trayText} t={props.clock} theme={props.theme} />
      </View>
    </View>
  );
}

/** Generic popup menu panel (context menus, dropdowns, start flyouts). */
export function PopupPanel(props: {
  popup: Popup;
  hover: number;
  theme: DesktopTheme;
}) {
  return (
    <View
      class={props.theme.popup}
      style={{
        insetL: 0,
        insetT: 0,
        translateX: props.popup.x,
        translateY: props.popup.y,
        width: props.popup.w,
        zIndex: 20000,
      }}
    >
      {props.popup.items.map((item, i) =>
        item.sep ? (
          <View class="h-[8] flex-col justify-center px-[1]">
            <View class={props.theme.popupSeparatorDark} />
            <View class={props.theme.popupSeparatorLight} />
          </View>
        ) : (
          <View
            class={props.theme.popupItem(
              props.hover === i && !item.disabled,
            )}
          >
            {item.checked ? (
              <Image
                class="w-[16] h-[16]"
                src={props.theme.iconSource("icons/check-16.svg")}
              />
            ) : item.icon ? (
              <Image
                class="w-[16] h-[16]"
                src={props.theme.iconSource(item.icon)}
              />
            ) : (
              <View class="w-[16] h-[16]" />
            )}
            <View class="flex-1 flex-row">
              <UiText
                cls={props.theme.popupText(
                  item.disabled
                    ? "disabled"
                    : props.hover === i
                      ? "hover"
                      : "normal",
                )}
                t={item.label}
                theme={props.theme}
              />
            </View>
            {item.shortcut ? (
              <UiText
                cls={props.theme.popupText(
                  item.disabled
                    ? "disabled"
                    : props.hover === i
                      ? "hover"
                      : "normal",
                )}
                t={item.shortcut}
                theme={props.theme}
              />
            ) : null}
            {item.sub ? (
              <Image
                class="w-[8] h-[8] ml-[2]"
                src={props.theme.iconSource("icons/menu-arrow.svg")}
              />
            ) : null}
          </View>
        ),
      )}
    </View>
  );
}

export interface StartItemRect {
  x: number;
  y: number;
  w: number;
  h: number;
  zone: StartMenuZone;
}

function zoneOf(item: PopupItem): StartMenuZone {
  return item.startZone ?? "primary";
}

function zoneHeight(
  items: PopupItem[],
  zone: StartMenuZone,
  theme: DesktopTheme,
): number {
  const m = theme.metrics;
  return items
    .filter((item) => zoneOf(item) === zone)
    .reduce((sum, item) => sum + (item.sep ? m.startSepH : m.startRowH), 0);
}

export function startMenuHeight(
  items: PopupItem[],
  theme: DesktopTheme,
): number {
  const m = theme.metrics;
  if (theme.id === "classic") return 2 + zoneHeight(items, "primary", theme);
  const bodyH = Math.max(
    196,
    zoneHeight(items, "primary", theme),
    zoneHeight(items, "secondary", theme),
  );
  return m.startHeaderH + bodyH + m.startFooterH;
}

export function startItemRect(
  items: PopupItem[],
  index: number,
  theme: DesktopTheme,
): StartItemRect {
  const m = theme.metrics;
  const item = items[index];
  const zone = zoneOf(item);
  if (theme.id === "classic") {
    let y = 1;
    for (let i = 0; i < index; i++)
      y += items[i].sep ? m.startSepH : m.startRowH;
    return {
      x: 25,
      y,
      w: m.startMenuW - 26,
      h: item.sep ? m.startSepH : m.startRowH,
      zone,
    };
  }

  const totalH = startMenuHeight(items, theme);
  if (zone === "footer") {
    const footer = items.filter((entry) => zoneOf(entry) === "footer" && !entry.sep);
    const at = footer.indexOf(item);
    const cellW = Math.floor(m.startMenuW / Math.max(1, footer.length));
    return {
      x: at * cellW + 4,
      y: totalH - m.startFooterH + 5,
      w: cellW - 8,
      h: 32,
      zone,
    };
  }

  const primaryW = 184;
  const sameZoneBefore = items.slice(0, index).filter((entry) => zoneOf(entry) === zone);
  const y =
    m.startHeaderH +
    sameZoneBefore.reduce(
      (sum, entry) => sum + (entry.sep ? m.startSepH : m.startRowH),
      0,
    );
  return {
    x: zone === "primary" ? 0 : primaryW,
    y,
    w: zone === "primary" ? primaryW : m.startMenuW - primaryW,
    h: item.sep ? m.startSepH : m.startRowH,
    zone,
  };
}

export function startMenuItemAt(
  items: PopupItem[],
  theme: DesktopTheme,
  x: number,
  y: number,
): number {
  for (let i = 0; i < items.length; i++) {
    if (items[i].sep) continue;
    const rect = startItemRect(items, i, theme);
    if (
      x >= rect.x &&
      x < rect.x + rect.w &&
      y >= rect.y &&
      y < rect.y + rect.h
    )
      return i;
  }
  return -1;
}

/** The Start menu. Classic uses its vertical rail; XP uses a user header,
 *  two-column application/system body and session footer. */
export function StartMenu(props: {
  x: number;
  y: number;
  h: number;
  items: Popup["items"];
  hover: number;
  theme: DesktopTheme;
}) {
  if (props.theme.id === "xp") {
    const m = props.theme.metrics;
    const bodyH = props.h - m.startHeaderH - m.startFooterH;
    return (
      <View
        class={props.theme.startMenu}
        style={{
          insetL: 0,
          insetT: 0,
          translateX: props.x,
          translateY: props.y,
          width: m.startMenuW,
          height: props.h,
          zIndex: 19000,
        }}
      >
        <View class={props.theme.startHeader}>
          <View class={props.theme.startAvatar}>
            <Image
              class="w-[28] h-[28]"
              src={props.theme.iconSource("icons/computer.svg")}
            />
          </View>
          <UiText
            bold
            cls={props.theme.startHeaderText}
            t="Pocket Desktop"
            theme={props.theme}
          />
        </View>
        <View
          class={props.theme.startPrimaryPane}
          style={{
            insetL: 0,
            insetT: m.startHeaderH,
            width: 184,
            height: bodyH,
          }}
        />
        <View
          class={props.theme.startSecondaryPane}
          style={{
            insetL: 184,
            insetT: m.startHeaderH,
            width: m.startMenuW - 184,
            height: bodyH,
          }}
        />
        <View class={props.theme.startFooter} />
        {props.items.map((item, i) => {
          const rect = startItemRect(props.items, i, props.theme);
          if (item.sep)
            return (
              <View
                class={props.theme.startSeparator(rect.zone)}
                style={{
                  insetL: 0,
                  insetT: 0,
                  translateX: rect.x,
                  translateY: rect.y,
                  width: rect.w,
                  height: rect.h,
                }}
              >
                <View class={props.theme.popupSeparatorDark} />
                <View class={props.theme.popupSeparatorLight} />
              </View>
            );
          const state = item.disabled
            ? "disabled"
            : props.hover === i
              ? "hover"
              : "normal";
          return (
            <View
              class={props.theme.startItem(rect.zone, props.hover === i && !item.disabled)}
              style={{
                insetL: 0,
                insetT: 0,
                translateX: rect.x,
                translateY: rect.y,
                width: rect.w,
                height: rect.h,
              }}
            >
              <Image
                class={props.theme.startItemIcon(rect.zone)}
                src={props.theme.iconSource(item.icon ?? "")}
              />
              <View class="flex-1 flex-row overflow-hidden">
                <UiText
                  bold={rect.zone !== "footer" && i < 3}
                  cls={props.theme.startItemText(rect.zone, state)}
                  t={item.label}
                  theme={props.theme}
                />
              </View>
              {item.sub ? (
                <Image
                  class="w-[8] h-[8]"
                  src={props.theme.iconSource("icons/menu-arrow.svg")}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View
      class={props.theme.startMenu}
      style={{
        insetL: 0,
        insetT: 0,
        translateX: props.x,
        translateY: props.y,
        width: props.theme.metrics.startMenuW,
        height: props.h,
        zIndex: 19000,
      }}
    >
      <View class={props.theme.startRail} />
      <View class="flex-1 flex-col">
        {props.items.map((item, i) =>
          item.sep ? (
            <View class={props.theme.startSeparator("primary")}>
              <View class={props.theme.popupSeparatorDark} />
              <View class={props.theme.popupSeparatorLight} />
            </View>
          ) : (
            <View
              class={props.theme.startItem(
                "primary",
                props.hover === i && !item.disabled,
              )}
            >
              <Image
                class={props.theme.startItemIcon("primary")}
                src={props.theme.iconSource(item.icon ?? "")}
              />
              <View class="flex-1 flex-row">
                <UiText
                  cls={props.theme.startItemText(
                    "primary",
                    item.disabled
                      ? "disabled"
                      : props.hover === i
                        ? "hover"
                        : "normal",
                  )}
                  t={item.label}
                  theme={props.theme}
                />
              </View>
              {item.sub ? (
                <Image
                  class="w-[8] h-[8]"
                  src={props.theme.iconSource("icons/menu-arrow.svg")}
                />
              ) : null}
            </View>
          ),
        )}
      </View>
    </View>
  );
}

/** Desktop icons: column-major 32px art + theme-selected labels. */
export function DesktopIcons(props: {
  icons: DeskIcon[];
  selected: number;
  rows: number;
  theme: DesktopTheme;
}) {
  return (
    <View class="absolute inset-0">
      {props.icons.map((icon, i) => (
        <View
          class="absolute left-0 top-0 w-[74] h-[48] flex-col items-center gap-[3]"
          style={{
            translateX: desktopIconPosition(i, props.rows).x,
            translateY: desktopIconPosition(i, props.rows).y,
          }}
        >
          <Image
            class="w-[32] h-[32]"
            src={props.theme.iconSource(icon.icon)}
          />
          <View
            class={props.selected === i ? props.theme.desktopSelection : "px-[2]"}
          >
            <UiText
              cls={props.theme.desktopLabel}
              t={icon.label}
              theme={props.theme}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
