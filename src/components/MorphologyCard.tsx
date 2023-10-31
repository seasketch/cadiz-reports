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

  const mapLabel = t("Map");
  const benthicLabel = t("Feature");
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
                        columnLabel: benthicLabel,
                        type: "class",
                        width: 40,
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
                              )
                            )
                          ),
                        valueLabel: sqKmLabel,
                        width: 30,
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
                  <Trans i18nKey="Geomorphology Card - learn more">
                    <p>
                      ℹ️ Overview: Seafloor features were identified based on
                      geomorphology, which classifies features using depth,
                      seabed slope, and other environmental characteristics.
                    </p>
                    <p>
                      In the Seafloor Geomorphic Features dataset, the seafloor
                      is split into shelves (shallowest), slopes, and abysses
                      (deepest). These three features are mutually exclusive.
                      Basins, canyons, escarpments, plateaus, rises, and sills
                      occur within these three features.
                    </p>
                    <p>
                      🎯 Planning Objective: No identified planning objectives
                      for geomorphic features.
                    </p>
                    <p>
                      🗺️ Source Data: Seafloor Geomorphic Features Map.{" "}
                      <a href="https://doi.org/10.1016/j.margeo.2014.01.011">
                        Harris, P.T., Macmillan-Lawler, M., Rupp, J. and Baker,
                        E.K. 2014. Geomorphology of the oceans. Marine Geology,
                        352: 4-24.
                      </a>{" "}
                      <a href="https://bluehabitats.org/">
                        https://bluehabitats.org/
                      </a>
                    </p>
                    <p>
                      📈 Report: The percentage of each feature type within this
                      plan is calculated by finding the overlap of each feature
                      type with the plan, summing its area, then dividing it by
                      the total area of each feature type found within the
                      selected nearshore planning area. If the plan includes
                      multiple areas that overlap, the overlap is only counted
                      once.
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
