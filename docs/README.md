@nightwatch/chrome-recorder

# @nightwatch/chrome-recorder

## Table of contents

### Functions

- [nightwatchStringifyChromeRecording](README.md#nightwatchstringifychromerecording)
- [parseRecordingContent](README.md#parserecordingcontent)
- [stringifyParsedStep](README.md#stringifyparsedstep)
- [transformParsedRecording](README.md#transformparsedrecording)

## Functions

### nightwatchStringifyChromeRecording

▸ **nightwatchStringifyChromeRecording**(`recording`): `Promise`<`Promise`<`string`\> \| `undefined`\>

#### Parameters

| Name        | Type     |
| :---------- | :------- |
| `recording` | `string` |

#### Returns

`Promise`<`Promise`<`string`\> \| `undefined`\>

#### Defined in

[main.ts:24](https://github.com/nightwatchjs/nightwatch-chrome-recorder/blob/main/src/main.ts#L24)

---

### parseRecordingContent

▸ **parseRecordingContent**(`recordingContent`): `Schema.UserFlow`

#### Parameters

| Name               | Type     |
| :----------------- | :------- |
| `recordingContent` | `string` |

#### Returns

`Schema.UserFlow`

#### Defined in

[main.ts:4](https://github.com/nightwatchjs/nightwatch-chrome-recorder/blob/main/src/main.ts#L4)

---

### stringifyParsedStep

▸ **stringifyParsedStep**(`step`): `Promise`<`string`\>

#### Parameters

| Name   | Type   |
| :----- | :----- |
| `step` | `Step` |

#### Returns

`Promise`<`string`\>

#### Defined in

[main.ts:18](https://github.com/nightwatchjs/nightwatch-chrome-recorder/blob/main/src/main.ts#L18)

---

### transformParsedRecording

▸ **transformParsedRecording**(`parsedRecording`): `Promise`<`string`\>

#### Parameters

| Name              | Type       |
| :---------------- | :--------- |
| `parsedRecording` | `UserFlow` |

#### Returns

`Promise`<`string`\>

#### Defined in

[main.ts:10](https://github.com/nightwatchjs/nightwatch-chrome-recorder/blob/main/src/main.ts#L10)
