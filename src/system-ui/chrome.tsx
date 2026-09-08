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
import { type DesktopTheme } from "./theme.ts";
import type { DeskIcon, Popup, TaskEntry, WinCtl } from "./state.ts";
import { desktopIconPosition } from "./wm.ts";

/** Desktop text. The baked slot rides the style prop — the class table never
 *  sees it (baked per-app via pak.json, docs in gen-assets.ts) — and the
 *  active theme owns which face each role maps to, so a theme switch reflows
 *  every string. Text rides the `t` prop; `cls` replaces the class attr so
 *  nothing falls through to a user component's attrs. */
export function UiText(props: {
  t: string;
  theme: DesktopTheme;
  cls?: string;
  bold?: boolean;
  xl?: boolean;
}) {
  return (
    <Text
      class={props.cls ?? "text-[#000000]"}
      style={{
        fontSlot: props.theme.fontSlot(
          props.xl ? "xl" : props.bold ? "bold" : "ui",
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
          {props.theme
            .captionButtonLayers(btn, w.pressedBtn.value === btn, props.active)
            .map((cls) => (
              <View class={cls} />
            ))}
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
      {props.theme.taskbarLayers.map((cls) => (
        <View class={cls} />
      ))}
      <View
        class={props.theme.startButton(props.startOpen)}
      >
        {props.theme.startLayers(props.startOpen).map((cls) => (
          <View class={cls} />
        ))}
        {props.theme.startLogo !== "" ? (
          <Image class="w-[16] h-[16]" src={props.theme.startLogo} />
        ) : null}
        <UiText
          theme={props.theme}
          bold
          cls={props.theme.startText}
          t="Start"
        />
      </View>
      <View class={props.theme.taskDivider} />
      <View class={props.theme.taskList}>
        {props.entries.map((entry) => (
          <View
            class={props.theme.taskButton(entry.id === props.activeId)}
            style={{ width: props.buttonW }}
          >
            <Image class="w-[16] h-[16]" src={entry.icon} />
            <View class="flex-1 flex-row overflow-hidden">
              <UiText
                theme={props.theme}
                bold={entry.id === props.activeId}
                cls={props.theme.taskText(entry.id === props.activeId)}
                t={entry.title}
              />
            </View>
          </View>
        ))}
      </View>
      <View class={props.theme.tray}>
        {props.theme.trayLayers.map((cls) => (
          <View class={cls} />
        ))}
        <UiText theme={props.theme} cls={props.theme.trayText} t={props.clock} />
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
              <Image class="w-[16] h-[16]" src="icons/check-16.svg" />
            ) : item.icon ? (
              <Image class="w-[16] h-[16]" src={item.icon} />
            ) : (
              <View class="w-[16] h-[16]" />
            )}
            <View class="flex-1 flex-row">
              <UiText
                theme={props.theme}
                cls={props.theme.popupText(
                  item.disabled
                    ? "disabled"
                    : props.hover === i
                      ? "hover"
                      : "normal",
                )}
                t={item.label}
              />
            </View>
            {item.shortcut ? (
              <UiText
                theme={props.theme}
                cls={props.theme.popupText(
                  item.disabled
                    ? "disabled"
                    : props.hover === i
                      ? "hover"
                      : "normal",
                )}
                t={item.shortcut}
              />
            ) : null}
            {item.sub ? (
              <Image class="w-[8] h-[8] ml-[2]" src="icons/menu-arrow.svg" />
            ) : null}
          </View>
        ),
      )}
    </View>
  );
}

/** One Start row: icon slot, label, submenu arrow. Shared by both panels. */
function StartRow(props: {
  item: Popup["items"][number];
  hover: boolean;
  theme: DesktopTheme;
}) {
  return (
    <View class={props.theme.startItem(props.hover && !props.item.disabled)}>
      <Image class="w-[16] h-[16]" src={props.item.icon ?? ""} />
      <View class="flex-1 flex-row">
        <UiText
          theme={props.theme}
          bold={props.item.bottom}
          cls={props.theme.popupText(
            props.item.disabled
              ? "disabled"
              : props.hover
                ? "hover"
                : "normal",
          )}
          t={props.item.label}
        />
      </View>
      {props.item.sub ? (
        <Image class="w-[8] h-[8]" src="icons/menu-arrow.svg" />
      ) : null}
    </View>
  );
}

function StartSep(props: { theme: DesktopTheme }) {
  return (
    <View class={props.theme.startSeparator}>
      <View class={props.theme.popupSeparatorDark} />
    </View>
  );
}

/** The XP Start panel: user header, a programs column with its pinned rows
 *  at the foot, a places column, and the Log-off strip. Geometry mirrors
 *  wm.ts startLayout — that is what app.tsx hit-tests against. */
export function StartPanel(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  items: Popup["items"];
  hover: number;
  user: string;
  theme: DesktopTheme;
}) {
  const at = (which: (it: Popup["items"][number]) => boolean) =>
    props.items
      .map((item, i) => ({ item, i }))
      .filter((e) => which(e.item));
  return (
    <View
      class={props.theme.startMenu}
      style={{
        insetL: 0,
        insetT: 0,
        translateX: props.x,
        translateY: props.y,
        width: props.w,
        height: props.h,
        zIndex: 19000,
      }}
    >
      {props.theme.startMenuLayers.map((cls) => (
        <View class={cls} />
      ))}
      <View class={props.theme.startHeader}>
        {props.theme.startHeaderLayers.map((cls) => (
          <View class={cls} />
        ))}
        <Image class={props.theme.startHeaderIcon} src="icons/xp-user.svg" />
        <UiText
          theme={props.theme}
          bold
          cls={props.theme.startHeaderName}
          t={props.user}
        />
      </View>
      <View class="flex-1 flex-row">
        <View class={props.theme.startColumn("left")}>
          {at((it) => !it.foot && it.col !== "right" && !it.bottom).map((e) =>
            e.item.sep ? (
              <StartSep theme={props.theme} />
            ) : (
              <StartRow
                item={e.item}
                hover={props.hover === e.i}
                theme={props.theme}
              />
            ),
          )}
          <View class="flex-1" />
          {at((it) => !it.foot && !!it.bottom).map((e) =>
            e.item.sep ? (
              <StartSep theme={props.theme} />
            ) : (
              <StartRow
                item={e.item}
                hover={props.hover === e.i}
                theme={props.theme}
              />
            ),
          )}
        </View>
        <View class={props.theme.startColumn("right")}>
          <View class={props.theme.startColumnDivider} />
          {at((it) => !it.foot && it.col === "right").map((e) =>
            e.item.sep ? (
              <StartSep theme={props.theme} />
            ) : (
              <StartRow
                item={e.item}
                hover={props.hover === e.i}
                theme={props.theme}
              />
            ),
          )}
        </View>
      </View>
      <View class={props.theme.startFooter}>
        {props.theme.startFooterLayers.map((cls) => (
          <View class={cls} />
        ))}
        {at((it) => !!it.foot).map((e) => (
          <View class={props.theme.startFooterItem(props.hover === e.i)}>
            <Image class="w-[16] h-[16]" src={e.item.icon ?? ""} />
            <UiText
              theme={props.theme}
              cls={props.theme.startFooterText}
              t={e.item.label}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

/** The Classic Start menu: rail + 26px rows; flyouts render as PopupPanels. */
export function StartMenu(props: {
  x: number;
  y: number;
  w: number;
  h: number;
  items: Popup["items"];
  hover: number;
  theme: DesktopTheme;
}) {
  return (
    <View
      class={props.theme.startMenu}
      style={{
        insetL: 0,
        insetT: 0,
        translateX: props.x,
        translateY: props.y,
        width: props.w,
        height: props.h,
        zIndex: 19000,
      }}
    >
      <View class={props.theme.startRail} />
      <View class="flex-1 flex-col">
        {props.items.map((item, i) =>
          item.sep ? (
            <View class="h-[8] flex-col justify-center px-[2]">
              <View class={props.theme.popupSeparatorDark} />
              <View class={props.theme.popupSeparatorLight} />
            </View>
          ) : (
            <View
              class={props.theme.startItem(
                props.hover === i && !item.disabled,
              )}
            >
              <Image class="w-[16] h-[16]" src={item.icon ?? ""} />
              <View class="flex-1 flex-row">
                <UiText
                  theme={props.theme}
                  cls={props.theme.popupText(
                    item.disabled
                      ? "disabled"
                      : props.hover === i
                        ? "hover"
                        : "normal",
                  )}
                  t={item.label}
                />
              </View>
              {item.sub ? (
                <Image class="w-[8] h-[8]" src="icons/menu-arrow.svg" />
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
          <Image class="w-[32] h-[32]" src={icon.icon} />
          <View
            class={props.selected === i ? props.theme.desktopSelection : "px-[2]"}
          >
            <UiText theme={props.theme} cls={props.theme.desktopLabel} t={icon.label} />
          </View>
        </View>
      ))}
    </View>
  );
}
