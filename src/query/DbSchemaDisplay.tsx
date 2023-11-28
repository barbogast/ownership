import { Card, Descriptions, Space } from "antd";
import { DbSchema } from "../util/database";

type Props = { dbSchema: DbSchema };

const DbSchemaDisplay = ({ dbSchema }: Props) => {
  return (
    <>
      <Space direction="horizontal">
        {dbSchema.tables.map((table) => (
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
      SQLite version: {dbSchema.version}
    </>
  );
};

export default DbSchemaDisplay;
