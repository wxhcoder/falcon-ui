<template>
  <div class="demo-col">
    <div class="demo-tip">
      点击任意数据单元格，观察当前行、当前列与表头列的交叉高亮。当前单元格保持原始背景，
      仅通过边框进行焦点强调。
    </div>

    <FlTable :data="rows" cross-highlight style="width: 100%">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="名称" min-width="180" />
      <el-table-column prop="status" label="状态" min-width="120" />
      <el-table-column prop="owner" label="负责人" min-width="140" />
    </FlTable>
  </div>
</template>

<script setup lang="ts">
interface TableRow {
  id: number
  name: string
  status: string
  owner: string
}

const rows: TableRow[] = [
  { id: 1001, name: '阿尔法科技', status: '启用', owner: '王敏' },
  { id: 1002, name: '贝塔物流', status: '待审核', owner: '刘洋' },
  { id: 1003, name: '伽马零售', status: '停用', owner: '陈卓' }
]
</script>

<style scoped>
.demo-tip {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}
</style>
