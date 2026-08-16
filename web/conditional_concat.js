import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "Custom.ConditionalStringConcat",
    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "ConditionalStringConcat") return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            onNodeCreated?.apply(this, arguments);

            const node = this;
            node.slotCount = 2; // 初期表示スロット数(保存データがなければこれが使われる)
            const MAX_SLOTS = 20;

            const findWidget = (name) =>
                node.widgets.find((w) => w.name === name);

            // 表示/非表示の切り替えのみ。サイズには一切触らない。
            const setSlotVisibility = () => {
                for (let i = 1; i <= MAX_SLOTS; i++) {
                    const t = findWidget(`text${i}`);
                    const e = findWidget(`enable${i}`);
                    const visible = i <= node.slotCount;
                    for (const w of [t, e]) {
                        if (!w) continue;
                        w.hidden = !visible;
                        w.computeSize = visible ? undefined : () => [0, -4];
                    }
                }
                app.graph.setDirtyCanvas(true, true);
            };

            // スロット数が実際に変わるときだけサイズを調整する。
            // node.size は一切リセットせず、変更前後の computeSize() の
            // 差分(delta)だけを現在のサイズに加えることで、
            // ユーザーが手動で広げた幅・高さを維持する。
            const changeSlotCount = (delta) => {
                const newCount = node.slotCount + delta;
                if (newCount < 1 || newCount > MAX_SLOTS) return;

                const prevSize = [node.size[0], node.size[1]];
                const prevComputed = node.computeSize();

                node.slotCount = newCount;
                setSlotVisibility();

                const newComputed = node.computeSize();
                const deltaHeight = newComputed[1] - prevComputed[1];

                // 幅: ユーザーが広げていればそれを維持(はみ出す場合のみ広げる)
                node.size[0] = Math.max(prevSize[0], newComputed[0]);
                // 高さ: 元の高さ + 増減分。ただし推奨サイズより小さくはしない
                node.size[1] = Math.max(prevSize[1] + deltaHeight, newComputed[1]);

                app.graph.setDirtyCanvas(true, true);
            };

            node.addWidget("button", "+ Add slot", null, () => {
                changeSlotCount(1);
            });

            node.addWidget("button", "- Remove slot", null, () => {
                changeSlotCount(-1);
            });

            // 保存時に slotCount を properties へ書き出す
            const onSerialize = node.onSerialize;
            node.onSerialize = function (o) {
                onSerialize?.apply(this, arguments);
                o.properties = o.properties || {};
                o.properties.slotCount = node.slotCount;
            };

            // 読み込み時に slotCount を復元する。
            // ここではサイズ計算を行わない — 保存されたワークフローJSONの
            // node.size は LiteGraph が別途復元してくれるため、
            // このタイミングでサイズをいじると再構成のたびに
            // ノードが勝手に伸びる不具合の原因になる。
            const onConfigure = node.onConfigure;
            node.onConfigure = function (o) {
                onConfigure?.apply(this, arguments);
                if (o.properties && typeof o.properties.slotCount === "number") {
                    node.slotCount = o.properties.slotCount;
                }
                setSlotVisibility();
            };

            // 初期化時も表示切り替えのみ、サイズには触らない
            setSlotVisibility();
        };
    },
});
