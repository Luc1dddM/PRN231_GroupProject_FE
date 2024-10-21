import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Button,
  Popover,
  Checkbox,
  Space,
  Tag,
  Row,
  Col,
  DatePicker,
  Input,
  Slider,
} from "antd";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Search } = Input;
const { RangePicker } = DatePicker;

const filterOptions = {
  status: [
    { id: "active", label: "Active", value: "active" },
    { id: "inactive", label: "In Active", value: "false" },
  ],
};

function ActionBar({ showModal }) {
  const [search, setSearch] = useSearchParams();

  const statusValues = search.getAll("Statuses") ?? [];

  const statusIds = filterOptions.status
    .filter((option) => statusValues.includes(option.value))
    .map((option) => option.id);

  const [selectedFilters, setSelectedFilters] = useState({
    status: statusIds ?? [],
    priceRange: [0, 1000],
    createdFrom: null,
    createdTo: null,
  });

  const [tempFilters, setTempFilters] = useState({
    status: [],
    priceRange: [0, 1000],
    createdFrom: null,
    createdTo: null,
  });

  const [popoverVisible, setPopoverVisible] = useState(false);

  const handleFilterChange = (filterType, checkedValues) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterType]: checkedValues,
    }));
  };

  const handleSave = () => {
    setSelectedFilters(tempFilters);
    handleChangeQuery(tempFilters);
    setPopoverVisible(false);
  };

  const handleChangeQuery = (object) => {
    if (object.status.length > 0) {
      search.delete("Statuse");
      object.status.forEach((status) => {
        search.append("Statuse", status === "active" ? "true" : "false");
      });
    } else {
      search.delete("Statuse");
    }

    if (object.priceRange && object.priceRange.length === 2) {
      search.set("minAmount", object.priceRange[0].toString());
      search.set("maxAmount", object.priceRange[1].toString());
    } else {
      search.delete("minAmount");
      search.delete("maxAmount");
    }

    setSearch(search, { replace: true });
  };

  const handleReset = () => {
    setTempFilters({
      status: [],
      priceRange: [0, 1000],
      createdFrom: null,
      createdTo: null,
    });
  };

  const removeFilter = (filterType, filterValue) => {
    if (filterType === "priceRange") {
      const RemovedTemp = {
        ...selectedFilters,
        priceRange: [0, 1000],
      };
      handleChangeQuery(RemovedTemp);
      setSelectedFilters(RemovedTemp);
    } else {
      const RemovedTemp = {
        ...selectedFilters,
        [filterType]: selectedFilters[filterType].filter(
          (value) => value !== filterValue
        ),
      };
      handleChangeQuery(RemovedTemp);
      setSelectedFilters(RemovedTemp);
    }
  };

  const handleSearch = (value) => {
    value ? search.set("Keyword", value) : search.delete("Keyword");
    setSearch(search, { replace: true });
  };

  const filterContent = (
    <div style={{ width: 300 }}>
      <div style={{ marginBottom: 16 }}>
        <h4>Price Range</h4>
        <Slider
          range
          min={0}
          max={1000}
          value={tempFilters.priceRange}
          onChange={(value) => handleFilterChange("priceRange", value)}
        />
        <div>
          {tempFilters.priceRange[0]} vnd - {tempFilters.priceRange[1]} vnd
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <h4>Status</h4>
        <Checkbox.Group
          value={tempFilters.status}
          onChange={(checkedValues) =>
            handleFilterChange("status", checkedValues)
          }
        >
          {filterOptions.status.map((option) => (
            <Checkbox key={option.id} value={option.value}>
              {option.label}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      <div style={{ marginBottom: 16 }}>
        <h4>Created At</h4>
        <RangePicker
          style={{ width: "100%" }}
          value={[tempFilters.createdFrom, tempFilters.createdTo]}
          onChange={(dates) => {
            handleFilterChange("createdFrom", dates[0]);
            handleFilterChange("createdTo", dates[1]);
          }}
        />
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
        <Button size="small" type="primary" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
        }}
      >
        <Row gutter={24} align="middle">
          <Col flex="none">
            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              <Search
                placeholder="Search..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
              />
              <Popover
                content={filterContent}
                title="Filters"
                trigger="click"
                visible={popoverVisible}
                onVisibleChange={(visible) => {
                  setPopoverVisible(visible);
                  if (visible) {
                    setTempFilters(selectedFilters);
                  }
                }}
              >
                <Button icon={<FilterOutlined />}>Filter</Button>
              </Popover>
            </Space>
          </Col>
          <Col flex="auto">
            <Space
              size="middle"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              <Button
                type="primary"
                onClick={showModal}
                style={{ backgroundColor: "#1890ff" }}
              >
                Add New
              </Button>
              <Button type="primary" style={{ backgroundColor: "#1890ff" }}>
                Export
              </Button>
              <Button type="primary" style={{ backgroundColor: "#1890ff" }}>
                Import
              </Button>
            </Space>
          </Col>
        </Row>
      </div>
      {Object.keys(selectedFilters).length > 0 && (
        <div
          style={{
            padding: "8px 24px",
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Row justify="end">
            <Col>
              <Space
                size="small"
                style={{ flexWrap: "wrap", justifyContent: "flex-end" }}
              >
                {Object.keys(selectedFilters).map((filterType) => {
                  if (filterType === "priceRange") {
                    return (
                      <Tag
                        key="priceRange"
                        closable
                        onClose={() => removeFilter("priceRange")}
                        style={{ marginRight: 3 }}
                      >
                        Price: {selectedFilters.priceRange[0]} vnd -
                        {selectedFilters.priceRange[1]} vnd
                      </Tag>
                    );
                  } else if (
                    filterType !== "createdFrom" &&
                    filterType !== "createdTo"
                  ) {
                    return (selectedFilters[filterType] || []).map((value) => (
                      <Tag
                        key={`${filterType}-${value}`}
                        closable
                        onClose={() => removeFilter(filterType, value)}
                        style={{ marginRight: 3 }}
                      >
                        {
                          filterOptions[filterType].find(
                            (option) => option.value === value
                          )?.label
                        }
                      </Tag>
                    ));
                  }
                  return null;
                })}
              </Space>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

ActionBar.propTypes = {
  showModal: PropTypes.func.isRequired,
};

export default ActionBar;
