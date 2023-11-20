import { Card, Descriptions, Space } from "antd";
import { DbSchema } from "../util/database";

type Props = { dbSchema: DbSchema };

const DbSchemaDisplay = ({ dbSchema }: Props) => {
  return (
    <>
      <Space direction="horizontal">
        {dbSchema.tables.map((table) => (
          <Card size="small" style={{ width: 300 }}>
            <Descriptions title={table.name} size="small" column={1} bordered>
              {table.columns.map((column) => (
                <Descriptions.Item label={column.name}>
                  {column.type}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Card>
        ))}
      </Space>
    </>
  );
};

export default DbSchemaDisplay;
