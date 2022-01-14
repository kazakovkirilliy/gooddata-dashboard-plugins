// (C) 2021 GoodData Corporation
import {
    DashboardContext,
    DashboardPluginV1,
    IDashboardCustomizer,
    IDashboardEventHandling,
} from "@gooddata/sdk-ui-dashboard";

import entryPoint from "../dp_replace_by_tag_plugin_entry";
import { GaugeAdapter } from "./Gauge";
import { insightTags, insightVisualizationUrl } from "@gooddata/sdk-model";

export class Plugin extends DashboardPluginV1 {
    public readonly author = entryPoint.author;
    public readonly displayName = entryPoint.displayName;
    public readonly version = entryPoint.version;
    public readonly minEngineVersion = entryPoint.minEngineVersion;
    public readonly maxEngineVersion = entryPoint.maxEngineVersion;

    /**
     * Tags define by plugin to be replaced.
     */
    public tags: string[] = [];

    public onPluginLoaded(
        _ctx: DashboardContext,
        parameters?: string
    ): Promise<void> | void {
        /**
         * Run the `link-plugin` command with `--with-parameters` flag and enter all the tags you want to replace with
         * `GaugeChart` separated by space. By default all bullet charts with tag `gauge` will be replaced.
         */
        this.tags = parameters?.split(" ") || ["gauge"];
    }

    public register(
        _ctx: DashboardContext,
        customize: IDashboardCustomizer,
        _handlers: IDashboardEventHandling
    ): void {
        customize.insightWidgets().withCustomProvider((insight) => {
            /**
             * If at least one tag from plugin parameters (or `gauge` tag) is present in the tags of the insight
             * and the type of the insight is bullet chart, replace this insight with GaugeAdapter component.
             */
            if (
                insightTags(insight).some(insightTag => this.tags.includes(insightTag)) &&
                insightVisualizationUrl(insight).includes("bullet")
            ) {
                return GaugeAdapter;
            }
            /**
             * If undefined is returned, nothing happens and original component stays in place.
             */
            return undefined;
        });
    }
}
