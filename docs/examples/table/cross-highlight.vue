<template>
  <div class="demo-col">
    <div class="demo-tip">
      点击任意数据单元格，观察当前行、当前列与表头列的交叉高亮。当前单元格保持原始背景，
      仅通过边框进行焦点强调。可切换“固定前 3 列”观察 fixed 场景下的高亮跟随效果。
    </div>

    <div class="demo-toolbar">
      <span class="demo-toolbar__label">固定前 3 列</span>
      <el-switch v-model="isFixedColumns" />
    </div>

    <FlTable :data="rows" cross-highlight style="width: 100%">
      <el-table-column :fixed="leftFixed" prop="id" label="ID" width="90" />
      <el-table-column :fixed="leftFixed" prop="name" label="名称" width="180" />
      <el-table-column :fixed="leftFixed" prop="status" label="状态" width="140" />
      <el-table-column prop="owner" label="负责人" min-width="140" />
      <el-table-column prop="region" label="区域" min-width="140" />
      <el-table-column prop="category" label="行业" min-width="160" />
      <el-table-column prop="level" label="等级" min-width="120" />
      <el-table-column prop="updatedAt" label="最近更新" min-width="180" />
      <el-table-column prop="remark" label="备注" min-width="220" />
    </FlTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface TableRow {
  id: number
  name: string
  status: string
  owner: string
  region: string
  category: string
  level: string
  updatedAt: string
  remark: string
}

const isFixedColumns = ref(false)

const leftFixed = computed(() => (isFixedColumns.value ? 'left' : undefined))

const rows: TableRow[] = [
  {
    id: 1001,
    name: '阿尔法科技',
    status: '启用',
    owner: '王敏',
    region: '华东',
    category: '企业服务',
    level: 'A',
    updatedAt: '2026-03-10 09:20',
    remark: '季度续约推进中'
  },
  {
    id: 1002,
    name: '贝塔物流',
    status: '待审核',
    owner: '刘洋',
    region: '华北',
    category: '物流运输',
    level: 'B',
    updatedAt: '2026-03-11 14:35',
    remark: '待补充资质材料'
  },
  {
    id: 1003,
    name: '伽马零售',
    status: '停用',
    owner: '陈卓',
    region: '华南',
    category: '新零售',
    level: 'C',
    updatedAt: '2026-03-12 17:10',
    remark: '历史合作已归档'
  }
]
</script>

<style scoped>
.demo-tip {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.demo-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 16px;
}

.demo-toolbar__label {
  color: var(--vp-c-text-1);
  font-size: 13px;
}
</style>
