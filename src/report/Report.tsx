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
import Chart from "./Chart";
import { updateBlocks, updateLabel, useReport } from "./reportStore";
import { ReadOnly, useReadOnly } from "../ReadonlyContext";

const ChartBlock = createReactBlockSpec({
  type: "dataDisplay",
  propSchema: {
    ...defaultProps,
    queryId: {
      default: "",
    },
  },
  containsInlineContent: true,
  render: ({ block }) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useReadOnly();
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Chart queryId={block.props.queryId} showEditLink={!readOnly} />
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
    const queryId: string | null = prompt("Enter chart id");
    if (queryId === null) {
      return;
    }
    editor.insertBlocks(
      [
        {
          type: "dataDisplay",
          props: {
            queryId,
          },
        },
      ],
      editor.getTextCursorPosition().block,
      "after"
    );
  },
  ["image", "img", "picture", "media"],
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
  const editor: BlockNoteEditor | null = useBlockNote({
    editable: !readOnly,
    blockSchema: {
      ...defaultBlockSchema,
      dataDisplay: ChartBlock,
    },
    slashCommands: [...defaultReactSlashMenuItems, insertImage],
    initialContent: blocks,

    onEditorContentChange: (editor) =>
      updateBlocks(reportId, editor.topLevelBlocks),
  });

  return (
    <ReadOnly readOnly={readOnly}>
      <>
        {!readOnly && (
          <>
            Label:{" "}
            <input
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
            href={`${window.location.protocol}//${window.location.host}/ownership/report/edit/${id}`}
            target="_blank"
          >
            Edit this report
          </a>
        ) : (
          <>
            <a
              href={`${window.location.protocol}//${window.location.host}/ownership/report/view/${id}`}
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
