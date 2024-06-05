<template>
  <div>
    <main-nav>
      <template v-slot:otherBreadcrumb>
        <nav-item>商品管理</nav-item>
        <nav-item>商品列表</nav-item>
      </template>
    </main-nav>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容"
            v-model="queryInfo.query"
            :clearable="true"
            @clear="getGoodsList">
            <el-button slot="append"
              icon="el-icon-search"
              @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="gotoAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table
        :data="goodsList"
        :border="true"
        :stripe="true">
        <el-table-column type="index"></el-table-column>
        <el-table-column
          label="商品名称"
          prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格（元）"
          prop="goods_price"
          width="130px"></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="80px"></el-table-column>
        <el-table-column
          label="创建时间"
          prop="add_time"
          width="160px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="176px">
          <template slot-scope="scope">
            <el-button
              icon="el-icon-edit"
              type="primary"
              size="mini"
              @click="showGoodsInfoDialog(scope.row)">修改</el-button>
            <el-button
              icon="el-icon-delete"
              type="danger"
              size="mini"
              @click="removeGoodById(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="goodsTotal">
    </el-pagination>
    </el-card>
    <!-- 修改商品信息对话框 -->
    <el-dialog
      title="商品信息"
      :visible.sync="showGoodsInfoDialogVisible">
      <el-form :model="theGoodInfo">
        <el-form-item
          label="商品名称"
          prop="goods_name">
          <el-input v-model="theGoodInfo.goods_name"></el-input>
        </el-form-item>
        <el-form-item
          label="商品价格（元）"
          prop="goods_price">
          <el-input v-model="theGoodInfo.goods_price"></el-input>
        </el-form-item>
        <el-form-item
          label="商品重量"
          prop="goods_weight">
          <el-input v-model="theGoodInfo.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showGoodsInfoDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateGoodInfo">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import MainNav from '@/components/navigation/MainNav'
import NavItem from '@/components/navigation/NavItem'

export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      goodsList: [],
      goodsTotal: 0,
      showGoodsInfoDialogVisible: false,
      theGoodInfo: {}
    }
  },

  created() {
    this.getGoodsList()
  },

  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.goodsTotal = res.data.total
    },

    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getGoodsList()
    },

    async removeGoodById(id) {
      const result = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (result === 'cancel') {
        return
      }
      const { data: res } = await this.$http
        .delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.getGoodsList()
      this.$message.success('删除成功')
    },

    gotoAddPage() {
      this.$router.push('/goods/add')
    },

    showGoodsInfoDialog(good) {
      this.theGoodInfo = good
      this.showGoodsInfoDialogVisible = true
    },

    async updateGoodInfo() {
      // console.log(this.theGoodInfo)
      const { data: res } = await this.$http
        .put(`goods/${this.theGoodInfo.goods_id}`, this.theGoodInfo)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.getGoodsList()
      this.showGoodsInfoDialogVisible = false
      this.$message.success('修改商品信息成功')
    }
  },

  components: {
    MainNav,
    NavItem
  }
}
</script>

<style lang="less" scoped>
</style>
