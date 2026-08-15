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

			const applyVisibility = () => {
				// 変更前のサイズを保存
				const prevSize = [node.size[0], node.size[1]];
				const prevComputed = node.computeSize();

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

				// 変更後の推奨サイズ
				const newComputed = node.computeSize();
				const deltaHeight = newComputed[1] - prevComputed[1];

				// 幅はユーザーが広げていればそれを維持(最小幅は下回らないようにする)
				node.size[0] = Math.max(prevSize[0], newComputed[0]);
				// 高さは「元のサイズ + 増減分」。ただし推奨サイズより小さくはしない
				node.size[1] = Math.max(prevSize[1] + deltaHeight, newComputed[1]);

				app.graph.setDirtyCanvas(true, true);
			};

			node.addWidget("button", "+ Add slot", null, () => {
				if (node.slotCount < MAX_SLOTS) {
					node.slotCount++;
					applyVisibility();
				}
			});

			node.addWidget("button", "- Remove slot", null, () => {
				if (node.slotCount > 1) {
					node.slotCount--;
					applyVisibility();
				}
			});

			// ここから追加: 保存時にslotCountをpropertiesへ書き出す
			const onSerialize = node.onSerialize;
			node.onSerialize = function (o) {
				onSerialize?.apply(this, arguments);
				o.properties = o.properties || {};
				o.properties.slotCount = node.slotCount;
			};

			// ここから追加: 読み込み時にslotCountを復元する
			const onConfigure = node.onConfigure;
			node.onConfigure = function (o) {
				onConfigure?.apply(this, arguments);
				if (o.properties && typeof o.properties.slotCount === "number") {
					node.slotCount = o.properties.slotCount;
				}
				applyVisibility();
			};
			applyVisibility();
		};
    },
});
