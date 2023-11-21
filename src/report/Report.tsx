import {
  BlockNoteEditor,
  DefaultBlockSchema,
  defaultBlockSchema,
  defaultProps,
} from "@blocknote/core";
import {
  BlockNoteView,
  InlineContent,
  ReactSlashMenuItem,
  createReactBlockSpec,
  getDefaultReactSlashMenuItems,
  useBlockNote,
} from "@blocknote/react";
import "@blocknote/core/style.css";
import { updateBlocks, updateLabel, Report } from "./reportStore";
import { ReadOnly, useReadOnly } from "./ReadonlyContext";
import { Input } from "antd";
import useQueryStore from "../query/queryStore";
import React from "react";

type DisplayComponent = React.FC<{ queryId: string; showEditLink: boolean }>;

const getChartBlock = (DisplayComponent: DisplayComponent) =>
  createReactBlockSpec({
    type: "dataDisplay",
    propSchema: {
      ...defaultProps,
      queryId: {
        default: "",
      },
    },
    containsInlineContent: true,
    render: ({ block, editor }): React.ReactElement => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const queries = Object.values(useQueryStore());

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const readOnly = useReadOnly();
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!readOnly && (
            <select
              value={block.props.queryId}
              onChange={(event) =>
                editor.updateBlock(block.id, {
                  ...block,
                  // @ts-expect-error Don't know what's wrong here, don't wanna fix it right now
                  props: { ...block.props, queryId: event.target.value },
                })
              }
            >
              {queries.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          )}
          {block.props.queryId && (
            <DisplayComponent
              queryId={block.props.queryId}
              showEditLink={!readOnly}
            />
          )}
          <InlineContent />
        </div>
      );
    },
  });

const insertImage: ReactSlashMenuItem<
  DefaultBlockSchema & { dataDisplay: ReturnType<typeof getChartBlock> }
> = {
  name: "Insert Chart",
  group: "Media",
  icon: <p>xx</p>,
  hint: "Insert a chart",
  execute: (editor) => {
    editor.insertBlocks(
      [
        {
          type: "dataDisplay",
          props: {
            queryId: "",
          },
        },
      ],
      editor.getTextCursorPosition().block,
      "after"
    );
  },
  // shortcut?: string;
};
type Props = {
  report: Report;
  readOnly?: boolean;
  displayComponent: DisplayComponent;
};
const Report: React.FC<Props> = ({
  report,
  readOnly = false,
  displayComponent,
}) => {
  const { blocks, label, id } = report;

  // Creates a new editor instance.
  // @ts-expect-error Seems to be an issue with @blocknote
  const editor: BlockNoteEditor | null = useBlockNote({
    editable: !readOnly,
    blockSchema: {
      ...defaultBlockSchema,
      dataDisplay: getChartBlock(displayComponent),
    },
    slashCommands: [...getDefaultReactSlashMenuItems(), insertImage],
    // @ts-expect-error Seems to be an issue with @blocknote
    initialContent: blocks,

    onEditorContentChange: (editor) =>
      // @ts-expect-error Seems to be an issue with @blocknote
      updateBlocks(id, editor.topLevelBlocks),
  });

  return (
    <ReadOnly readOnly={readOnly}>
      <>
        {!readOnly && (
          <>
            <Input
              addonBefore="Label"
              value={label}
              onChange={(event) => updateLabel(report.id, event.target.value)}
            />
          </>
        )}
        <br />
        <br />

        {/* @ts-expect-error Don't know what's wrong here, don't wanna fix it right now */}
        <BlockNoteView editor={editor} />
        <br />
        <br />
        {readOnly ? (
          <a
            href={`${window.location.protocol}//${window.location.host}/ownership/#/report/edit/${id}`}
            target="_blank"
          >
            Edit this report
          </a>
        ) : (
          <>
            <a
              href={`${window.location.protocol}//${window.location.host}/ownership/#/report/view/${id}`}
              target="_blank"
            >
              <button>Preview</button>
            </a>
            <br />
            <br />
          </>
        )}
      </>
    </ReadOnly>
  );
};

export default Report;
