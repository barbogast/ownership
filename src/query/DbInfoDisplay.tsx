import { Card, Descriptions, Space } from "antd";
import { DbInfo } from "../util/database";

type Props = { dbInfo: DbInfo };

const DbSchemaDisplay = ({ dbInfo }: Props) => {
  return (
    <>
      <Space direction="horizontal">
        {dbInfo.tables.map((table) => (
          <Card size="small" style={{ width: 300 }} key={table.name}>
            <Descriptions
              title={table.name}
              size="small"
              column={1}
              bordered
              items={table.columns.map((column) => ({
                key: column.name,
                label: column.name,
                children: column.type,
              }))}
            />
          </Card>
        ))}
      </Space>
      <br />
      <br />
      SQLite version: {dbInfo.version}
    </>
  );
};

export default DbSchemaDisplay;
