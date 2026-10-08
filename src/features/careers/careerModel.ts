import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import sequelize from "../../lib/database/sequelize";

class JobPosting extends Model<
  InferAttributes<JobPosting>,
  InferCreationAttributes<JobPosting>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare department: string;
  declare location: string;
  declare employmentType: "full-time" | "part-time" | "contract" | "internship";
  declare salaryRange: string | null;
  declare description: string;
  declare requirements: string;
  declare responsibilities: string;
  declare benefits: string | null;
  declare applicationEmail: string;
  declare isActive: CreationOptional<boolean>;
  declare displayOrder: CreationOptional<number>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

JobPosting.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    employmentType: {
      type: DataTypes.ENUM("full-time", "part-time", "contract", "internship"),
      allowNull: false,
      defaultValue: "full-time",
    },
    salaryRange: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    benefits: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applicationEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "job_postings",
    timestamps: true,
    freezeTableName: true,
    indexes: [
      { fields: ["isActive"] },
      { fields: ["department"] },
      { fields: ["employmentType"] },
      { fields: ["displayOrder"] },
    ],
  }
);

export default JobPosting;
