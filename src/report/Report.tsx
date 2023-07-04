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
  defaultReactSlashMenuItems,
  useBlockNote,
} from "@blocknote/react";
import "@blocknote/core/style.css";
import ReportDisplay from "./ReportDisplay";
import { updateBlocks, updateLabel, useReport } from "./reportStore";
import { ReadOnly, useReadOnly } from "../ReadonlyContext";
import { Input } from "antd";
import useQueryStore from "../query/queryStore";

const ChartBlock = createReactBlockSpec({
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
    const queries = Object.values(useQueryStore().queries);

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
                props: { ...block.props, queryId: event.target.value },
              })
            }
          >
            {queries.map((q) => (
              <option value={q.id}>{q.label}</option>
            ))}
          </select>
        )}
        {block.props.queryId && (
          <ReportDisplay
            queryId={block.props.queryId}
            showEditLink={!readOnly}
          />
        )}
        <InlineContent />
      </div>
    );
  },
});

// Creates a slash menu item for inserting an image block.
const insertImage = new ReactSlashMenuItem<
  DefaultBlockSchema & { dataDisplay: typeof ChartBlock }
>(
  "Insert Chart",
  (editor) => {
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
  ["chart", "query", "picture", "media"],
  "Media",
  <p>XXX </p>,
  "Insert a chart"
);

type Props = {
  reportId: string;
  readOnly?: boolean;
};
const Report: React.FC<Props> = ({ reportId, readOnly = false }) => {
  const { blocks, label, id } = useReport(reportId);

  // Creates a new editor instance.
  // @ts-expect-error Seems to be an issue with @blocknote
  const editor: BlockNoteEditor | null = useBlockNote({
    editable: !readOnly,
    blockSchema: {
      ...defaultBlockSchema,
      dataDisplay: ChartBlock,
    },
    slashCommands: [...defaultReactSlashMenuItems, insertImage],
    // @ts-expect-error Seems to be an issue with @blocknote
    initialContent: blocks,

    onEditorContentChange: (editor) =>
      // @ts-expect-error Seems to be an issue with @blocknote
      updateBlocks(reportId, editor.topLevelBlocks),
  });

  return (
    <ReadOnly readOnly={readOnly}>
      <>
        {!readOnly && (
          <>
            <Input
              addonBefore="Label"
              value={label}
              onChange={(event) => updateLabel(reportId, event.target.value)}
            />
          </>
        )}
        <br />
        <br />

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
