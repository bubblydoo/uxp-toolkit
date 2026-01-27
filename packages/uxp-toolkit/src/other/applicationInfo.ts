import { z } from "zod";
import { batchPlayCommand, createCommand } from "../core/command";

export async function photoshopGetApplicationInfo() {
  return await batchPlayCommand(photoshopApplicationInfoCommand);
}

const photoshopAppInfoSchema = z.object({
  active: z.boolean(),
  autoShowHomeScreen: z.boolean(),
  available: z.number(),
  buildNumber: z.string(),
  documentArea: z.object({
    left: z.number(),
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
  }),
  hostName: z.string(),
  hostVersion: z.object({
    versionMajor: z.number(),
    versionMinor: z.number(),
    versionFix: z.number(),
  }),
  localeInfo: z.object({
    decimalPoint: z.string(),
  }),
  osVersion: z.string(),
  panelList: z.array(
    z.object({
      ID: z.string(),
      name: z.string(),
      obscured: z.boolean(),
      visible: z.boolean(),
    })
  ),
});

const photoshopApplicationInfoCommand = createCommand({
  modifying: false,
  descriptor: {
    _obj: "get",
    _target: [
      {
        _ref: "application",
        _enum: "ordinal",
        _value: "targetEnum",
      },
    ],
  },
  schema: photoshopAppInfoSchema,
});

// $PnCK: {_enum: "cursorKind", _value: "brushSize"}
// MRUColorList: (2) [{…}, {…}]
// active: false
// autoShowHomeScreen: true
// available: 20622344192
// backgroundColor: {_obj: "RGBColor", red: 255, grain: 255, blue: 255}
// buildNumber: "26.8.0 (20250518.m.3079 c5cae55)"
// cachePrefs: {_obj: "cachePrefs", historyStates: 50, numberOfCacheLevels: 4, numberOfCacheLevels64: 4, tileSize: 131072, …}
// colorPickerPrefs: {_obj: "colorPickerPrefsClass", pickerKind: {…}, pickerID: ""}
// colorSettings: {_obj: "colorSettings", workingRGB: "Display P3", workingCMYK: "U.S. Web Coated (SWOP) v2", workingGray: "Dot Gain 20%", workingSpot: "Dot Gain 20%", …}
// contentCredentialsAvailable: true
// controlColor: {_enum: "controlColorChartreuse", _value: "controlColorDefault"}
// currentToolOptions: {_obj: "currentToolOptions", contiguous: true, selectionEnum: 0, $MrqI: {…}, $MrqF: {…}, …}
// defaultAppScript: 0
// displayPrefs: {_obj: "displayPrefs", paintingCursors: {…}, otherCursors: {…}, cursorShape: {…}, cursorBrushTipOutlineStrokeWidth: 2, …}
// documentArea: {left: 0, top: 56, right: 1512, bottom: 982}
// earlyAccessPrefs: {_obj: "earlyAccessPrefs"}
// exactPoints: false
// experimentalFeatures: {_obj: "experimentalFeatures", enhancedControlsTouchBarPropertyFeedback: true, expFeatureDeepUpscale: true, expFeatureContentAwareTracing: false, FocusMode: false, …}
// exportAssetsPrefs: {_obj: "exportAssetsPrefs", exportFileType: "PNG", exportFilePath: "", exportAssetJPGQualityEnum: 6, exportAssetsLocationSetting: 3, …}
// eyeDropperSample: {_enum: "eyeDropperSampleType", _value: "samplePoint"}
// featureAccessLevel: "PublicBeta"
// fileSavePrefs: {_obj: "fileSavePrefsClass", previewsQuery: {…}, previewWinThumbnail: true, extensionsQuery: {…}, lowerCase: true, …}
// fontLargeName: ".AppleSystemUIFont"
// fontLargeSize: 12
// fontList: {_obj: "fontList", fontName: Array(1294), fontPostScriptName: Array(1294), fontFamilyName: Array(1294), fontStyleName: Array(1294)}
// fontSmallName: ".AppleSystemUIFont"
// fontSmallSize: 10
// foregroundColor: {_obj: "RGBColor", red: 211.00000262260437, grain: 247.99610942602158, blue: 185.99611312150955}
// foregroundColorRGB: {_obj: "RGBColor", red: 201, grain: 249, blue: 179}
// generalPreferences: {_obj: "generalPreferences", colorPickerPrefs: {…}, colorPickerHUDMode: {…}, interpolationMethod: {…}, historyLog: false, …}
// globalAngle: {_obj: "globalAngle", globalLightingAngle: {…}, globalAltitude: {…}}
// gradientClassEvent: 4
// gridMajor: 65536
// guidesPrefs: {_obj: "guidesPrefs", guidesColor: {…}, guidesStyle: {…}, activeArtboardGuidesColor: {…}, activeArtboardGuidesStyle: {…}, …}
// highlightColorOption: {_enum: "highlightColorOptionEnumType", _value: "uiDefaultHighlightColor"}
// historyLogPreferences: {_obj: "historyLogPreferences", historyLog: false, saveHistoryTo: {…}, log: false, editLogItems: {…}, …}
// historyPreferences: {_obj: "historyPrefsClass", maximumStates: 50, snapshotInitial: true, nonLinear: false}
// homeScreenVisibility: true
// hostName: "Adobe Photoshop (Beta)"
// hostVersion: {_obj: "version", versionMajor: 26, versionMinor: 8, versionFix: 0}
// imageProcessingPrefs: {_obj: "imageProcessingPrefs", imageProcessingSelectSubjectPrefs: {…}, imageProcessingSelectionsProcessingPrefsStr: {…}, imageProcessingRemoveToolProcessingPrefsStr: {…}, imageProcessingEnhanceResolutionProcessingPrefsStr: {…}}
// interfaceBevelHighlight: {_obj: "interfaceColor", interfaceColorRed32: 112, interfaceColorGreen32: 112, interfaceColorBlue32: 112, interfaceColorRed2: 112, …}
// interfaceBevelShadow: {_obj: "interfaceColor", interfaceColorRed32: 74, interfaceColorGreen32: 74, interfaceColorBlue32: 74, interfaceColorRed2: 74, …}
// interfaceBlack: {_obj: "interfaceColor", interfaceColorRed32: 0, interfaceColorGreen32: 0, interfaceColorBlue32: 0, interfaceColorRed2: 0, …}
// interfaceBorder: {_obj: "interfaceColor", interfaceColorRed32: 255, interfaceColorGreen32: 255, interfaceColorBlue32: 255, interfaceColorRed2: 255, …}
// interfaceButtonDarkShadow: {_obj: "interfaceColor", interfaceColorRed32: 83, interfaceColorGreen32: 83, interfaceColorBlue32: 83, interfaceColorRed2: 83, …}
// interfaceButtonDownFill: {_obj: "interfaceColor", interfaceColorRed32: 56, interfaceColorGreen32: 56, interfaceColorBlue32: 56, interfaceColorRed2: 56, …}
// interfaceButtonShadow: {_obj: "interfaceColor", interfaceColorRed32: 255, interfaceColorGreen32: 255, interfaceColorBlue32: 255, interfaceColorRed2: 255, …}
// interfaceButtonText: {_obj: "interfaceColor", interfaceColorRed32: 240, interfaceColorGreen32: 240, interfaceColorBlue32: 240, interfaceColorRed2: 240, …}
// interfaceButtonUpFill: {_obj: "interfaceColor", interfaceColorRed32: 71, interfaceColorGreen32: 71, interfaceColorBlue32: 71, interfaceColorRed2: 71, …}
// interfaceCanvasColor: {_obj: "interfaceColor", interfaceColorRed32: 40, interfaceColorGreen32: 40, interfaceColorBlue32: 40, interfaceColorRed2: 40, …}
// interfaceIconFillActive: {_obj: "interfaceColor", interfaceColorRed32: 56, interfaceColorGreen32: 56, interfaceColorBlue32: 56, interfaceColorRed2: 56, …}
// interfaceIconFillDimmed: {_obj: "interfaceColor", interfaceColorRed32: 77, interfaceColorGreen32: 77, interfaceColorBlue32: 77, interfaceColorRed2: 77, …}
// interfaceIconFillSelected: {_obj: "interfaceColor", interfaceColorRed32: 56, interfaceColorGreen32: 56, interfaceColorBlue32: 56, interfaceColorRed2: 56, …}
// interfaceIconFrameActive: {_obj: "interfaceColor", interfaceColorRed32: 255, interfaceColorGreen32: 255, interfaceColorBlue32: 255, interfaceColorRed2: 255, …}
// interfaceIconFrameDimmed: {_obj: "interfaceColor", interfaceColorRed32: 94, interfaceColorGreen32: 94, interfaceColorBlue32: 94, interfaceColorRed2: 94, …}
// interfaceIconFrameSelected: {_obj: "interfaceColor", interfaceColorRed32: 255, interfaceColorGreen32: 255, interfaceColorBlue32: 255, interfaceColorRed2: 255, …}
// interfaceOWLPaletteFill: {_obj: "interfaceColor", interfaceColorRed32: 83, interfaceColorGreen32: 83, interfaceColorBlue32: 83, interfaceColorRed2: 83, …}
// interfacePaletteFill: {_obj: "interfaceColor", interfaceColorRed32: 83, interfaceColorGreen32: 83, interfaceColorBlue32: 83, interfaceColorRed2: 83, …}
// interfacePrefs: {_obj: "interfacePrefs", colorChannels: false, canvasBackgroundColors: Array(4), showMenuColors: true, paletteEnhancedFontTypeKey: {…}, …}
// interfaceRed: {_obj: "interfaceColor", interfaceColorRed32: 238, interfaceColorGreen32: 0, interfaceColorBlue32: 0, interfaceColorRed2: 238, …}
// interfaceStaticText: {_obj: "interfaceColor", interfaceColorRed32: 214, interfaceColorGreen32: 214, interfaceColorBlue32: 214, interfaceColorRed2: 214, …}
// interfaceToolTipBackground: {_obj: "interfaceColor", interfaceColorRed32: 255, interfaceColorGreen32: 255, interfaceColorBlue32: 205, interfaceColorRed2: 255, …}
// interfaceToolTipText: {_obj: "interfaceColor", interfaceColorRed32: 0, interfaceColorGreen32: 0, interfaceColorBlue32: 0, interfaceColorRed2: 0, …}
// interfaceTransparencyBackground: {_obj: "interfaceColor", interfaceColorRed32: 204, interfaceColorGreen32: 204, interfaceColorBlue32: 204, interfaceColorRed2: 204, …}
// interfaceTransparencyForeground: {_obj: "interfaceColor", interfaceColorRed32: 255, interfaceColorGreen32: 255, interfaceColorBlue32: 255, interfaceColorRed2: 255, …}
// interfaceWhite: {_obj: "interfaceColor", interfaceColorRed32: 255, interfaceColorGreen32: 255, interfaceColorBlue32: 255, interfaceColorRed2: 255, …}
// interpolationMethod: {_enum: "interpolationType", _value: "bicubicAutomatic"}
// kuiBrightnessLevel: {_enum: "uiBrightnessLevelEnumType", _value: "kPanelBrightnessMediumGray"}
// layerThumbnailSize: {_enum: "size", _value: "small"}
// layerVisibilityChangesAreUndoable: true
// limited: false
// localeInfo: {decimalPoint: ","}
// modalDialogLevel: 0
// modalToolLevel: 0
// mondoFilterLevel: 0
// numberOfActionSets: 2
// numberOfCacheLevels: 4
// numberOfCacheLevels64: 4
// numberOfDocuments: 0
// osVersion: "Mac OS 26.0.0"
// panelList: (48) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// panelUILockIsEnabled: false
// playbackOptions: {performance: {…}, historyStates: {…}}
// pluginPicker: {_obj: "pluginPicker", showAllFilterGalleryEntries: false, enablePluginDeveloperMode: true, generatorEnabled: false}
// preferencesFolder: {_path: "/Users/otto/Library/Preferences/Adobe Photoshop (Beta) Settings/", _kind: "local"}
// presetManager: (8) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// printSettings: {_obj: "printSettings", $cMat: true, $gWrn: false, $pWht: true, $Runt: 1, …}
// privacyPrefs: {_obj: "privacyPrefs"}
// recentFiles: (100) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// recentFilesAsStrings: (100) ["/Users/otto/BubblyDoo Dropbox/NAS/Products/Peppa P… Be Anything - Style v1/2025/characterPreview.psd", "/Users/otto/Downloads/download (11).png", "/Users/otto/Code/projects/bubbly/doo/packages/uxp-toolkit/src/test-fixtures/color-profile-test-2.psd", "/Users/otto/BubblyDoo Dropbox/NAS/Products/Bing/Bo…k/Art/Done/Cover/bingBusySearchBook_coverSoft.psd", "/Users/otto/Downloads/body-colors-new.psd", "/Users/otto/BubblyDoo Dropbox/NAS/Products/In-hous…se Father's Day Book/v1_2024/Color files/skin.psd", "/Users/otto/Downloads/download (9).png", "/Users/otto/Downloads/body-colors (2).psd", "/Users/otto/Downloads/body-colors (1).psd", "/Users/otto/Downloads/body-colors.psd", "/Users/otto/Downloads/93cf41f0-f56d-4314-b80c-aa210c604f2a.png", "/Users/otto/Downloads/download (2).png", "/Users/otto/Pictures/Screenshots/Screenshot 2025-06-01 at 15.36.48.png", "/Users/otto/Pictures/Screenshots/Screenshot 2025-06-01 at 15.36.42.png", "/Users/otto/Pictures/Screenshots/Screenshot 2025-05-28 at 21.22.05.png", "/Users/otto/Downloads/image.jpeg", "/Users/otto/Downloads/a6f9cd09-c864-4cf9-b782-87b4a97204a7.png", "/Users/otto/Downloads/neutral.png", "/Users/otto/Downloads/download (8).png", "/Users/otto/Downloads/lut-small.png", "/Users/otto/Downloads/0aa31084-c5cd-4cdc-b8c3-d59b76c9132b.pdf", "/Users/otto/Downloads/b9b9e4c1-ed7d-4ba6-a5a6-73b4b36f17ff.pdf", "/Users/otto/Downloads/47214bf2-f774-4330-b12e-ce1e9f403cc0.pdf", "/Users/otto/Library/CloudStorage/GoogleDrive-hanso…apchat filters UAntwerpen/iphone x/middelheim.psd", "/Users/otto/Library/CloudStorage/GoogleDrive-hanso…hat filters UAntwerpen/iphone x/hof-van-liere.psd", "/Users/otto/Library/CloudStorage/GoogleDrive-hanso…hat filters UAntwerpen/iphone x/groenenborger.psd", "/Users/otto/Library/CloudStorage/GoogleDrive-hanso…Snapchat filters UAntwerpen/iphone x/mutsaard.psd", "/Users/otto/Library/CloudStorage/GoogleDrive-hanso…apchat filters UAntwerpen/iphone x/drie-eiken.psd", "/Users/otto/Library/CloudStorage/GoogleDrive-hanso…rk/Snapchat filters UAntwerpen/pdfs/all-large.pdf", "/Users/otto/Library/CloudStorage/GoogleDrive-hanso…k/Snapchat filters UAntwerpen/pdfs/all-phones.pdf", "/Users/otto/Downloads/7dda084a-cb3e-42f7-aaeb-c1b423d5c32b.png", "/Users/otto/capture-out.pdf", "/Users/otto/Downloads/8f5c1131-ff95-42f2-836c-7e2274614f84.pdf", "/Users/otto/Downloads/1425a6a2-8131-4fab-9df0-c7442673ffcf.png", "/Users/otto/Downloads/a1d52b98-7d30-42ce-a125-dd1e170c2a65.png", "/Users/otto/Downloads/425e8760-c975-484f-9d25-a729a118c921.pdf", "/Users/otto/Downloads/1458ecc2-0447-4ad7-a2af-d82952546fd6.pdf", "/Users/otto/Downloads/968cd85f-0efb-4542-9676-c292df3d8b05.pdf", "/Users/otto/BubblyDoo Dropbox/NAS/Asset Library/Pe…Assets/peppaPigCanBeAnything_characterPreview.psd", "/Users/otto/Documents/mask test.psd", "/Users/otto/Downloads/bubbyBiographyTaylor_coverPreview.psd", "/Users/otto/Downloads/kid (1).psd", "/Users/otto/Downloads/kid.psd", "/Users/otto/Downloads/taylor spread 1.psd", "/Users/otto/Code/projects/spicesapp/public/sources/kohlers-medizinal-pflanzen.png", "/Users/otto/Downloads/ezgif-66a3acd86715ed.png", "/Users/otto/Downloads/download (1).avif", "/Users/otto/Downloads/download (3).png", "/Users/otto/Downloads/download (4).png", "/Users/otto/BubblyDoo Dropbox/NAS/Asset Library/Pe…Peppa Style v0 in progress/Assets/Pose Normal.psd", "/Users/otto/BubblyDoo Dropbox/NAS/Products/Peppa P…ck/V2/Art/Original/peppaPig_backpackSquare_v2.psd", "/Users/otto/BubblyDoo Dropbox/NAS/Products/PAW Pat… - dec/PAW RRR 22 - 05/PAW_DAD_big_spread 1V2.psd", "/Users/otto/Pictures/Screenshots/Screenshot 2024-12-11 at 13.04.59.png", "/Users/otto/BubblyDoo Dropbox/NAS/Products/PAW Pat…atshirt_contentBackgroundScaledToView_newTmpl.psd", "/Users/otto/BubblyDoo Dropbox/NAS/Products/PAW Pat…istmasAOPSweatshirt_contentBackground_newTmpl.psd", "/Users/otto/BubblyDoo Dropbox/NAS/Products/PAW Pat…d/pawChristmasAOPSweatshirt_contentBackground.psd", "/Users/otto/Downloads/image (17).png", "/Users/otto/Downloads/image (16).png", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…atshirt_contentBackgroundScaledToView_newTmpl.psd", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…interSweatshirt_contentBackgroundScaledToView.psd", "/Users/otto/Downloads/152-158.pdf", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…ound/pawAOPWinterSweatshirt_contentBackground.psd", "/Users/otto/Downloads/29b26ae3-4e03-43be-b145-835ee962fae7.pdf", "/Users/otto/Documents/altvelo.psd", "/Users/otto/Pictures/Screenshots/Screenshot 2024-11-06 at 22.06.39.png", "/Users/otto/Downloads/Paw Patrol_AOP Sweatshirt_Winter.png", "/Users/otto/Downloads/Paw Patrol_AOP Sweatshirt_Winter.pdf", "/Users/otto/Code/projects/bubbly/doo/packages/tran…res/color-mask-alignment/color-mask-alignment.psd", "/Users/otto/Code/projects/bubbly/doo/packages/tran…res/color-mask-alignment/color-mask-alignment.png", "/Users/otto/Downloads/5e3dc28a-4294-43ef-bf68-9cf4169224b5.pdf", "/Users/otto/Downloads/d45dca38-c7be-4a6f-bbc1-d1239cf52c3a.jpg", "/Users/otto/Downloads/0000e917-93bc-477c-a66c-1e18d06f3e57.pdf", "/Users/otto/Downloads/102a43ad-1da5-48fe-ab51-dfc91fa568cc.pdf", "/Users/otto/Downloads/7904a124-aee6-4de0-b64b-c1b3e022f29d.pdf", "/Users/otto/Downloads/ef96debf-dbcf-4895-adf9-78fe5e5d0e8a.pdf", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…y Book/Pages/Done/Page 1/PAW_BDAY_big_spread1.psd", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…n/Art/Done/pawActionBlanket_contentBackground.psd", "/Users/otto/Downloads/bb5804b0-fe61-42ed-8eaa-d4f4c70d0748.png", "/Users/otto/Downloads/7ad893d5-ac6d-474a-8ddc-fcb847872016.png", "/Users/otto/Downloads/f2bb7ada-3183-482f-a326-c5dca3b81b29.pdf", "/Users/otto/Downloads/f556932a-347e-4449-b952-e2ab7395a891.pdf", "/Users/otto/Downloads/gtg-omw.gif", "/Users/otto/Downloads/rgb-DisplayP3HDR.png", "/Users/otto/Downloads/rgb-DisplayP3HDR.avif", "/Users/otto/Code/projects/bubbly/doo/packages/tran…ecolormatrix-bug-repro/rgb-DisplayP3-UltraHDR.jpg", "/Users/otto/Downloads/rgb-ProPhotoRGB.jpg", "/private/var/folders/zq/kmwpbcs50y31p80v9x6bt0ww0000gn/T/Fa97cRx_d.webp", "/Users/otto/Code/projects/bubbly/doo/packages/tran…ormatrix-bug-repro/rgb-DisplayP3-UltraHDR-ps2.jpg", "/Users/otto/Code/projects/bubbly/doo/packages/tran…lormatrix-bug-repro/rgb-DisplayP3-UltraHDR-ps.jpg", "/Users/otto/Downloads/rgb-ProPhotoRGB-xs.jpg", "/Users/otto/Downloads/65x100 Blanket (1).pdf", "/Users/otto/Downloads/100x150 Blanket (2).pdf", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…cts/In-house/Inhouse Towel Summer/Colors/skin.psd", "/Users/otto/Downloads/Screenshot_20240718-120437.png", "/Users/otto/Downloads/Screenshot_2024-07-18-12-05-55-29_e4424258c8b8649f6e67d283a50a2cbc.jpg", "/Users/otto/Downloads/Screenshot 2024-07-18 at 12.03.02.png", "/Users/otto/Downloads/capture.pdf", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…box/Spreads/Done/brezo_bumbaLunchbox_lidCover.psd", "/Users/otto/Library/CloudStorage/SynologyDrive-syn…eads/Done/brezo_bumbaLunchbox_lidCover_merged.psd", "/Users/otto/Downloads/out.png"]
// regionCode: 0
// rulerUnits: {_enum: "rulerUnits", _value: "rulerPixels"}
// scratchDiskPreferences: {_obj: "scratchDiskPreferences", scratchDisks: Array(1)}
// showToolTips: true
// size: 64
// tileSize: 1048576
// tool: {_enum: "marqueeRectTool", _value: "targetEnum"}
// toolBarVisible: false
// toolSupportsBrushPresets: false
// toolSupportsBrushes: false
// tools: (108) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, …]
// toolsPreferences: {_obj: "toolsPreferences", showToolTips: true, enableGestures: true, overscrollEnabled: true, resizeWindowsOnZoom: true, …}
// transparencyGamutPreferences: {_enum: "checkerboardSize", _value: "checkerboardMedium"}
// transparencyPrefs: {_obj: "transparencyPrefs", transparencyGamutPreferences: {…}, transparencyGridColors: {…}, gamutWarning: {…}, opacity: {…}}
// typePreferences: {_obj: "typePreferences", smartQuotes: true, textComposerChoice: {…}, enableFontFallback: true, enableGlyphAlternate: false, …}
// unitsPrefs: {_obj: "unitsPrefs", rulerUnits: {…}, typeUnits: {…}, columnWidth: {…}, gutterWidth: {…}, …}
// useCacheForHistograms: false
// used: 836602160
// vectorToolSettings: {_obj: "toolPreset", $SCrT: true, toolUserSelectionRecencyRank: 296, mode: {…}, opacity: 100, …}
// watchSuspension: 0
// workspaceList: (6) [{…}, {…}, {…}, {…}, {…}, {…}]
// workspacePreferences: {_obj: "workspacePreferences", enableNarrowOptionBar: false, autoCollapseDrawers: false, enableLargeTabs: true, autoShowRevealStrips: true, …}
// _warning: "hostVersion property is now available via require('uxp').host.version"
// [[Prototype]]: Object
