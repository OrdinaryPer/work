<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        :show-icon="true">
      </el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedCategoryKeys"
            :options="categoryList"
            :props="categoryProps"
            popper-class="cascader-panel"
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabsClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary"
            size="mini"
            :disabled="isButtonDisabled"
            @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="dynamicTableData"
            :border="true"
            :stripe="true">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  :closable="true"
                  @close="handleClosed(index, scope.row)">
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  ref="saveTagInput"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称"
              prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="showEditDialog(scope.row.attr_id)">
                    编辑
                  </el-button>
                  <el-button type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="removeParameters(scope.row.attr_id)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary"
            size="mini"
            :disabled="isButtonDisabled"
            @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="staticTableData"
            :border="true"
            :stripe="true">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  :closable="true"
                  @close="handleClosed(index, scope.row)">
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  ref="saveTagInput"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称"
              prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    @click="showEditDialog(scope.row.attr_id)">
                    编辑
                  </el-button>
                  <el-button type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="removeParameters(scope.row.attr_id)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+ titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form ref="addFormRef"
        :model="addForm"
        label-width="100px"
        :rules="addFormRules">
        <el-form-item :label="titleText"
          prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParameters">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+ titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form ref="editFormRef"
        :model="editForm"
        label-width="100px"
        :rules="editFormRules">
        <el-form-item :label="titleText"
          prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParameters">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categoryList: [],
      categoryProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      selectedCategoryKeys: [],
      activeName: 'many',
      dynamicTableData: [],
      staticTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入属性名称',
            trigger: 'blur'
          }
        ]
      },
      inputVisible: false,
      inputValue: ''
    }
  },

  created() {
    this.getCategoryList()
  },

  methods: {
    async getCategoryList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      this.categoryList = res.data
    },

    handleChange() {
      this.getParametersData()
    },

    handleTabsClick() {
      this.getParametersData()
    },

    async getParametersData() {
      if (this.selectedCategoryKeys.length !== 3) {
        this.selectedCategoryKeys = []
        this.dynamicTableData = []
        this.staticTableData = []
        return
      }
      const { data: res } = await this.$http
        .get(`categories/${this.categoryId}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
      if (res.meta.status !== 200) {
        return this.$message.error('获取动态参数失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals
          ? item.attr_vals.split(' ')
          : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.dynamicTableData = res.data
      } else {
        this.staticTableData = res.data
      }
    },

    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    addParameters() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http
          .post(`categories/${this.categoryId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getParametersData()
        this.addDialogVisible = false
      })
    },

    async showEditDialog(attrId) {
      const { data: res } = await this.$http
        .get(`categories/${this.categoryId}/attributes/${attrId}`, {
          params: {
            attr_sel: this.activeName
          }
        })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    editParameters() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http
          .put(`categories/${this.categoryId}/attributes/${this.editForm.attr_id}`, {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          })
        if (res.meta.status !== 200) {
          this.$message.error('修改参数失败')
        }
        this.getParametersData()
        this.$message.success('修改成功')
        this.editDialogVisible = false
      })
    },

    async removeParameters(attrId) {
      const result = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'cancel') {
        return
      }
      const { data: res } = await this.$http
        .delete(`categories/${this.categoryId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getParametersData()
      this.$message.success('删除成功')
    },

    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      this.saveParameters(row)
    },

    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleClosed(index, row) {
      row.attr_vals.splice(index, 1)
      this.saveParameters(row)
    },

    async saveParameters(row) {
      const { data: res } = await this.$http
        .put(`categories/${this.categoryId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
      if (res.meta.status !== 200) {
        return this.$message.error('修改失败')
      }
      row.inputValue = ''
      row.inputVisible = false
      this.$message.success('修改成功')
    }
  },

  computed: {
    isButtonDisabled() {
      return this.selectedCategoryKeys.length !== 3
    },

    categoryId() {
      if (this.selectedCategoryKeys.length === 3) {
        return this.selectedCategoryKeys[2]
      }
      return null
    },

    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
