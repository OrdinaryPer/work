<template>
  <div>
    <main-nav>
      <template v-slot:otherBreadcrumb>
        <nav-item>商品管理</nav-item>
        <nav-item>商品分类</nav-item>
      </template>
    </main-nav>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table :data="categoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text="#"
        :border="true"
        :show-row-hover="false"
        class="tree-table">
        <template slot="isValidate" slot-scope="scope">
          <i class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === 0"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <template slot="sort" slot-scope="scope">
          <el-tag size="mini"
            v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini"
            v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini"
            v-else>三级</el-tag>
        </template>
        <template slot="operation" slot-scope="scope">
          <el-button type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="updateCategory(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">
            删除
          </el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="categoryTotal">
    </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="50%"
      @close="addCategoryDialogClosed">
      <el-form :model="addCategoryForm"
        :rules="addCategoryRules"
        ref="addCategoryFormRef"
        label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            :options="parentCategoryList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCategoryChanged"
            :clearable="true"
            :change-on-select="true"
            popper-class="cascader-panel">
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </span>
</el-dialog>
  </div>
</template>

<script>
import MainNav from '@/components/navigation/MainNav'
import NavItem from '@/components/navigation/NavItem'

export default {
  data() {
    return {
      categoryList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      categoryTotal: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isValidate'
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      addCategoryDialogVisible: false,
      addCategoryForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCategoryRules: {
        cat_name: [
          {
            required: true,
            message: '请输入商品分类名称',
            trigger: 'blur'
          }
        ]
      },
      parentCategoryList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedKeys: []
    }
  },

  created() {
    this.getCategoryList()
  },

  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分类数据获取失败')
      }
      console.log(res)
      this.categoryList = res.data.result
      this.categoryTotal = res.data.total
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },

    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCategoryList()
    },

    showAddCategoryDialog() {
      this.getParentCategoryList()
      this.addCategoryDialogVisible = true
    },

    async getParentCategoryList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      // console.log(res.data)
      this.parentCategoryList = res.data
    },

    parentCategoryChanged() {
      // console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        this.addCategoryForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        this.addCategoryForm.cat_level = this.selectedKeys.length
      } else {
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      }
    },

    addCategory() {
      // console.log(this.addCategoryForm)
      this.$refs.addCategoryFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http
          .post('categories', this.addCategoryForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCategoryList()
        this.addCategoryDialogVisible = false
      })
    },

    addCategoryDialogClosed() {
      this.$refs.addCategoryFormRef.resetFields()
      this.selectedKeys = []
      this.addCategoryForm.cat_level = 0
      this.addCategoryForm.cat_pid = 0
    },

    updateCategory(row) {
      console.log(row)
    }
  },

  components: {
    MainNav,
    NavItem
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
