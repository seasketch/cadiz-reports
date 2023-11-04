import React from "react";
import {
  Collapse,
  ResultsCard,
  useSketchProperties,
  ToolbarCard,
  LayerToggle,
  ClassTable,
  SketchClassTable,
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  squareMeterToKilometer,
  valueFormatter,
  Metric,
  MetricGroup,
  toPercentMetric,
} from "@seasketch/geoprocessing/client-core";

import project from "../../project";
import Translator from "./TranslatorAsync";
import { Trans, useTranslation } from "react-i18next";

const Number = new Intl.NumberFormat("en", { style: "decimal" });

export const MorphologyCard: React.FunctionComponent = () => {
  const [{ isCollection }] = useSketchProperties();
  const { t } = useTranslation();

  const metricGroup = project.getMetricGroup("morphologyOverlap", t);
  const precalcMetrics = project.getPrecalcMetrics(metricGroup, "area");

  const classLabel = t("Class");
  const areaWithin = t("Area Within Plan");
  const percAreaWithin = t("% Area Within Plan");
  const sqKmLabel = t("km²");

  return (
    <>
      <ResultsCard
        title={t("Marine Communities")}
        functionName="morphologyOverlap"
        useChildCard={true}
      >
        {(data: ReportResult) => {
          let singleMetrics = data.metrics.filter(
            (m) => m.sketchId === data.sketch.properties.id
          );

          const finalMetrics = [
            ...singleMetrics,
            ...toPercentMetric(
              singleMetrics,
              precalcMetrics,
              project.getMetricGroupPercId(metricGroup)
            ),
          ];

          return (
            <>
              <ToolbarCard
                title={t("Seabed Morphology")}
                items={<LayerToggle layerId={metricGroup.layerId} />}
              >
                <Translator>
                  <ClassTable
                    rows={finalMetrics}
                    metricGroup={metricGroup}
                    columnConfig={[
                      {
                        columnLabel: classLabel,
                        type: "class",
                        width: 35,
                      },
                      {
                        columnLabel: areaWithin,
                        type: "metricValue",
                        metricId: metricGroup.metricId,
                        valueFormatter: (val: string | number) =>
                          Number.format(
                            Math.round(
                              squareMeterToKilometer(
                                typeof val === "string" ? parseInt(val) : val
                              ) * 100
                            ) / 100
                          ),
                        valueLabel: sqKmLabel,
                        width: 35,
                        colStyle: { textAlign: "center" },
                      },
                      {
                        columnLabel: percAreaWithin,
                        type: "metricChart",
                        metricId: project.getMetricGroupPercId(metricGroup),
                        valueFormatter: "percent",
                        chartOptions: {
                          showTitle: true,
                          targetLabelPosition: "bottom",
                          targetLabelStyle: "tight",
                          barHeight: 11,
                        },
                        width: 35,
                        targetValueFormatter: (
                          value: number,
                          row: number,
                          numRows: number
                        ) => {
                          if (row === 0) {
                            return (value: number) =>
                              `${valueFormatter(
                                value / 100,
                                "percent0dig"
                              )} ${t("Target")}`;
                          } else {
                            return (value: number) =>
                              `${valueFormatter(value / 100, "percent0dig")}`;
                          }
                        },
                      },
                    ]}
                  />
                </Translator>

                {isCollection && (
                  <Collapse title={t("Show by MPA")}>
                    {genSketchTable(data, precalcMetrics, metricGroup)}
                  </Collapse>
                )}

                <Collapse title={t("Learn more")}>
                  <Trans id="Morphology card - learn more">
                    <p>
                      This report shows overlap with seabed morphological
                      classes within the proposed area.
                    </p>
                  </Trans>
                </Collapse>
              </ToolbarCard>
            </>
          );
        }}
      </ResultsCard>
    </>
  );
};

const genSketchTable = (
  data: ReportResult,
  precalcMetrics: Metric[],
  metricGroup: MetricGroup
) => {
  // Build agg metric objects for each child sketch in collection with percValue for each class
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(
      data.metrics.filter((m) => m.metricId === metricGroup.metricId),
      childSketchIds
    ),
    precalcMetrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    metricGroup.classes,
    childSketches
  );
  return (
    <SketchClassTable rows={sketchRows} metricGroup={metricGroup} formatPerc />
  );
};
